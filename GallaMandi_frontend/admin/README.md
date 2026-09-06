# GallaMandi Admin Dashboard

This folder is a frontend admin dashboard for the PostgreSQL-ready GallaMandi backend.

## Local use

1. Copy this `admin` folder into `GallaMandi_frontend/`.
2. Keep the backend running on `http://localhost:5000`.
3. Make your own account an admin in Supabase:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'YOUR_EMAIL';
```

4. Log out and log in again so the new JWT contains `role: admin`.
5. Open `admin/index.html` with Live Server.

## Features

- Dashboard statistics
- Add products
- Edit products
- Deactivate products (soft delete)
- Restore products
- JSONB attribute editor
- Supabase Storage image URL field
- Order listing and status updates
- User listing

The backend must remain the authority for admin authorization. Hiding the dashboard link is not a security feature; all `/api/admin/*` and product write endpoints require both a valid JWT and the `admin` role.
