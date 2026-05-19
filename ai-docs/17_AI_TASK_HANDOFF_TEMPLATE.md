# 17 — AI Task Handoff Template

Use this file when asking Claude, ChatGPT, Cursor, Codex, or any AI coding assistant to work on the project.

## Task Context

Project:
Saudi Car Rental Comparison and Lead Generation Platform

Repository:
`https://github.com/Abdelhamidzain/saudi-car-rental`

Current phase:
Manual MVP.

Business model:
Comparison + lead generation only. No booking or payment in MVP.

## Required Reading

Before working, read:
- `00_MASTER_CONTEXT.md`
- `01_NON_NEGOTIABLE_RULES.md`
- Any file related to the task.

## Task

Describe the exact task here.

Example:
Build the admin lead management dashboard.

## Must Follow

- Do not add booking/payment.
- Do not guarantee final prices.
- Use starts-from pricing.
- Save all leads in database.
- Add activity logs with date/time.
- Keep admin dashboard first.
- Keep company dashboard for later unless requested.
- Do not show negative trust labels publicly.
- Do not expose customer data publicly.

## Expected Output

Ask AI to provide:
1. Summary of changes.
2. Files changed.
3. Database changes.
4. Environment variables needed.
5. Testing steps.
6. Risks or assumptions.
7. Next recommended task.

## Acceptance Criteria

Define here:
- What must work.
- What must not break.
- How to test it.
