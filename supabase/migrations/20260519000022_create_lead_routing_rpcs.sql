-- =============================================================================
-- Migration: 20260519000022_create_lead_routing_rpcs
-- Purpose:   Admin manual lead routing primitives.
--
-- Two atomic RPCs power the Task 4.1 routing UI:
--
--   1. assign_lead_to_company_with_log
--      - Inserts a new lead_company_routing row (status = 'not_sent').
--      - Updates leads.assigned_company_id / assigned_branch_id / assigned_whatsapp
--        to reflect the *current* admin assignment.
--      - Inserts a matching lead_activity_logs entry (lead_assigned_to_company).
--
--   2. record_routing_sent_with_log
--      - Marks an existing routing row as sent (company_response_status='sent',
--        sent_at, sent_by_user_id).
--      - If the lead's status is still 'new' or 'reviewed', advances it to
--        'sent_to_company' and writes a paired lead_status_changed log entry.
--      - Always writes a lead_sent_to_company activity log entry.
--
-- Both functions are SECURITY DEFINER with search_path pinned to public,
-- matching migrations 016/019/020/021.
--
-- The Copy and Open WhatsApp actions are pure log inserts and do not need an
-- RPC — they are handled by a single INSERT in the server action.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. assign_lead_to_company_with_log
-- ---------------------------------------------------------------------------

create or replace function public.assign_lead_to_company_with_log(
  p_lead_id            uuid,
  p_company_id         uuid,
  p_branch_id          uuid,
  p_whatsapp_number    text,
  p_generated_message  text,
  p_actor_user_id      uuid
)
returns table(routing_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_routing_id uuid;
  v_company_name text;
  v_branch_label text;
begin
  -- Sanity: lead must exist.
  if not exists (select 1 from public.leads where id = p_lead_id) then
    raise exception 'lead % not found', p_lead_id;
  end if;

  -- Sanity: company + branch must exist and the branch must belong to the
  -- chosen company (when both provided).
  if not exists (select 1 from public.companies where id = p_company_id) then
    raise exception 'company % not found', p_company_id;
  end if;
  if p_branch_id is not null then
    if not exists (
      select 1 from public.branches
      where id = p_branch_id and company_id = p_company_id
    ) then
      raise exception 'branch % does not belong to company %', p_branch_id, p_company_id;
    end if;
  end if;

  -- Resolve labels for the activity log description.
  select name_ar into v_company_name
    from public.companies where id = p_company_id;

  if p_branch_id is not null then
    select coalesce(district, address_ar, 'فرع') into v_branch_label
      from public.branches where id = p_branch_id;
  else
    v_branch_label := null;
  end if;

  -- Create the routing row.
  insert into public.lead_company_routing (
    lead_id, company_id, branch_id, whatsapp_number, generated_message,
    company_response_status
  ) values (
    p_lead_id, p_company_id, p_branch_id, p_whatsapp_number, p_generated_message,
    'not_sent'
  )
  returning id into v_routing_id;

  -- Update the lead's "current assignment" pointer columns.
  update public.leads
     set assigned_company_id = p_company_id,
         assigned_branch_id  = p_branch_id,
         assigned_whatsapp   = p_whatsapp_number
   where id = p_lead_id;

  -- Activity log.
  insert into public.lead_activity_logs (
    lead_id, event_type, title, description,
    actor_type, actor_id, metadata_json
  ) values (
    p_lead_id,
    'lead_assigned_to_company',
    'Lead assigned to company',
    'Assigned to ' || coalesce(v_company_name, p_company_id::text)
      || case when v_branch_label is not null then ' — ' || v_branch_label else '' end,
    'admin', p_actor_user_id,
    jsonb_build_object(
      'routing_id', v_routing_id,
      'company_id', p_company_id,
      'branch_id', p_branch_id,
      'whatsapp_number', p_whatsapp_number
    )
  );

  return query select v_routing_id;
end;
$$;

comment on function public.assign_lead_to_company_with_log is
  'Creates a lead_company_routing row, updates the lead''s assigned_* pointer columns, and logs the assignment. Atomic.';


-- ---------------------------------------------------------------------------
-- 2. record_routing_sent_with_log
-- ---------------------------------------------------------------------------

create or replace function public.record_routing_sent_with_log(
  p_routing_id       uuid,
  p_lead_id          uuid,
  p_actor_user_id    uuid,
  p_note             text default null
)
returns table(routing_id uuid, lead_status_changed boolean, old_status public.lead_status, new_status public.lead_status)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_routing_lead_id uuid;
  v_old_status public.lead_status;
  v_new_status public.lead_status;
  v_status_changed boolean := false;
  v_company_name text;
begin
  -- Verify routing exists and belongs to this lead (defence-in-depth: the
  -- caller may have stale IDs).
  select lcr.lead_id, c.name_ar
    into v_routing_lead_id, v_company_name
    from public.lead_company_routing lcr
    join public.companies c on c.id = lcr.company_id
   where lcr.id = p_routing_id
   for update;

  if v_routing_lead_id is null then
    raise exception 'routing % not found', p_routing_id;
  end if;
  if v_routing_lead_id <> p_lead_id then
    raise exception 'routing % does not belong to lead %', p_routing_id, p_lead_id;
  end if;

  -- Lock the lead row and read its status.
  select status into v_old_status
    from public.leads
   where id = p_lead_id
   for update;
  v_new_status := v_old_status;

  -- Mark the routing as sent.
  update public.lead_company_routing
     set company_response_status = 'sent',
         sent_at        = coalesce(sent_at, now()),
         sent_by_user_id = coalesce(sent_by_user_id, p_actor_user_id)
   where id = p_routing_id;

  -- Auto-advance the lead's status only when it's still in an early state.
  if v_old_status in ('new', 'reviewed') then
    update public.leads
       set status = 'sent_to_company'
     where id = p_lead_id;
    v_new_status := 'sent_to_company';
    v_status_changed := true;

    -- Companion log entry for the implicit status change so the timeline is
    -- consistent with explicit changes done via update_lead_status_with_log.
    insert into public.lead_activity_logs (
      lead_id, event_type, title,
      old_value, new_value, actor_type, actor_id
    ) values (
      p_lead_id, 'lead_status_changed', 'Status auto-advanced',
      v_old_status::text, v_new_status::text, 'admin', p_actor_user_id
    );
  end if;

  -- Primary activity log entry.
  insert into public.lead_activity_logs (
    lead_id, event_type, title, description,
    actor_type, actor_id, metadata_json
  ) values (
    p_lead_id,
    'lead_sent_to_company',
    'Sent to company',
    'Marked as sent to ' || coalesce(v_company_name, 'company')
      || case when p_note is not null then ' — ' || p_note else '' end,
    'admin', p_actor_user_id,
    jsonb_build_object('routing_id', p_routing_id)
  );

  return query
    select p_routing_id, v_status_changed, v_old_status, v_new_status;
end;
$$;

comment on function public.record_routing_sent_with_log is
  'Marks a lead_company_routing row as sent, optionally auto-advances lead.status to sent_to_company, and writes activity log entries. Atomic.';
