-- =============================================================================
-- Migration: 20260519000021_create_lead_status_change_rpc
-- Purpose:   Atomic lead-status change with a matching activity-log entry.
--
-- Pairs with the Task 3 RPC create_lead_with_activity_log (migration 020).
-- The admin dashboard's status-change UI calls this RPC instead of doing
-- two PostgREST round-trips, so the lead row and its audit-log entry are
-- always in sync.
--
-- search_path is pinned to public to match the hardening migration (019).
-- =============================================================================

create or replace function public.update_lead_status_with_log(
  p_lead_id          uuid,
  p_new_status       public.lead_status,
  p_actor_user_id    uuid,
  p_note             text default null
)
returns table(lead_id uuid, old_status public.lead_status, new_status public.lead_status)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_status public.lead_status;
begin
  -- Read the current status under a row lock so a concurrent update can't
  -- race us into an inconsistent old_value / new_value pair.
  select status into v_old_status
  from public.leads
  where id = p_lead_id
  for update;

  if v_old_status is null then
    raise exception 'lead % not found', p_lead_id;
  end if;

  -- No-op if nothing changed — still log it so the timeline shows the
  -- explicit admin action, but skip the update touch on updated_at.
  if v_old_status = p_new_status then
    insert into public.lead_activity_logs (
      lead_id, event_type, title, description,
      old_value, new_value, actor_type, actor_id
    ) values (
      p_lead_id, 'lead_status_changed', 'Status reaffirmed', p_note,
      v_old_status::text, p_new_status::text, 'admin', p_actor_user_id
    );

    return query
      select p_lead_id, v_old_status, p_new_status;
    return;
  end if;

  update public.leads
     set status = p_new_status
   where id = p_lead_id;

  insert into public.lead_activity_logs (
    lead_id, event_type, title, description,
    old_value, new_value, actor_type, actor_id
  ) values (
    p_lead_id, 'lead_status_changed', 'Status changed', p_note,
    v_old_status::text, p_new_status::text, 'admin', p_actor_user_id
  );

  return query
    select p_lead_id, v_old_status, p_new_status;
end;
$$;

comment on function public.update_lead_status_with_log is
  'Atomically updates lead.status and inserts a lead_activity_logs row. Called from the admin dashboard. p_actor_user_id is the authenticated admin user id (public.users.id).';
