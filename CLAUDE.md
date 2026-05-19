@AGENTS.md

# Claude Instructions — Saudi Car Rental Platform

Before working on this repository, always read:

1. `ai-docs/01_NON_NEGOTIABLE_RULES.md`
2. `ai-docs/30_AI_CONTEXT_REFRESH_SUMMARY.md`
3. `ai-docs/31_PROJECT_PROGRESS_STATUS.md`
4. The task-specific file from `ai-docs/`

This project is a Saudi car rental comparison and lead generation platform.

MVP rules:
- Do not build booking or payment.
- Do not guarantee final prices.
- Prices are "starts from" only.
- The rental company contacts the customer directly.
- Admin dashboard comes before company dashboard.
- Manual workflow comes before automation.
- Every lead action must be logged with date/time.
- Do not show negative trust labels publicly.
- Do not expose customer data publicly.

Before editing files:
1. Inspect the current codebase.
2. Explain the implementation plan.
3. List files to create/modify.
4. Wait for approval if the task is large.

After editing:
1. Run `npx tsc --noEmit`
2. Run `npm run build`
3. Summarize files changed.
4. Mention risks or assumptions.