# Supabase Integration for CAT ExamEase Admin Backend

## Configuration

- Obtain `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and `SUPABASE_JWT_SECRET` from your Supabase project dashboard ("Project Settings > API" and "Service Role Key").
- For strong admin authentication, create your superadmin via the Supabase dashboard and assign "superadmin" as their `user_metadata.role`.

```
.env file example:

SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

## Usage

- The backend requires a Bearer JWT token (from Supabase Auth) for all `/admin/*` routes.
- The token must belong to a user with `user_metadata.role = "superadmin"`.
- All data operations (users, results, schedules, etc.) are handled via Supabase tables and auth.

## Endpoints Overview

- `POST   /admin/user`       — Add new user (admin/candidate). Fields: email, password, name, role
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
