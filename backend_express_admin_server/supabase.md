# Supabase Integration for CAT ExamEase Admin Backend

## Configuration

- Obtain `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and `SUPABASE_JWT_SECRET` from your Supabase project dashboard ("Project Settings > API" and "Service Role Key").
- For strong admin authentication, create your superadmin via the Supabase dashboard and assign "superadmin" as their `user_metadata.role`.
- Add `IS_DEMO_MODE=true` in `.env` to enable demo/test data visibility in UI and API (optional, for showcasing only demo records).

```
.env file example:

SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
IS_DEMO_MODE=true   # Optional, enables filtering & demo data visibility
```

## Usage

- The backend requires a Bearer JWT token (from Supabase Auth) for all `/admin/*` routes.
- The token must belong to a user with `user_metadata.role = "superadmin"` or `"admin"` for appropriate endpoints.
- All data operations (users, results, schedules, etc.) are handled via Supabase tables and auth.
- Demo-mode data is inserted (and tagged) via `scripts/seed_demo_data.js` with the field `is_demo=true` on all related rows (users, results, schedule, halltickets, revaluations).
- UI/frontend and backend can leverage the `IS_DEMO_MODE` env to display only demo test data for sandboxing.

## Demo Data Seeding

- To insert sample records for 10 demo students (for dashboards, results, etc.), run:
  ```
  node backend_express_admin_server/seed_demo_data.js
  ```
- Clears/updates demo records, ensures referential integrity. Resulting data includes user accounts with predictable emails and "candidate" roles, plus cross-table test data.
- All demo rows include: `is_demo: true` property for filtering (useful for demo environments, toggled by `IS_DEMO_MODE`).

## Endpoints Overview

- `POST   /admin/users`      — Add new user (candidate/admin/superadmin). Fields: email, password, name, role (JWT: admin/superadmin required)
- `POST   /admin/user`       — Add new user (admin/candidate). (Legacy; prefer /admin/users for fine role assignment)
- `PUT    /admin/user/:id`   — Update user (email/password/name/role)

- `POST   /admin/result`     — Add exam result
- `PUT    /admin/result/:id` — Update result

- `POST   /admin/schedule`   — Add exam schedule
- `PUT    /admin/schedule/:id` — Update schedule

- `POST   /admin/hallticket` — Add hall ticket
- `PUT    /admin/hallticket/:id` — Update hall ticket

- `POST   /admin/notification` — Add a notification
- `PUT    /admin/notification/:id` — Update notification

- `POST   /admin/revaluation` — Add revaluation request
- `PUT    /admin/revaluation/:id` — Update revaluation

All endpoints require Bearer token of a superadmin user.

## To extend

- You may expand endpoints to support deletion, retrieval, search, or bulk updates as needed.
- For sensitive environments, rotate your Supabase service key and JWT secret regularly.
- Use the `is_demo` column for test/demo environments and add `IS_DEMO_MODE` flag to optionally restrict candidate/admin UI/API output.
