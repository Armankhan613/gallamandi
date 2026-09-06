# GallaMandi Backend — PostgreSQL + Supabase Storage

This backend uses PostgreSQL (Supabase) for relational application data and Supabase Storage for product images.

## Local setup

1. Create `.env` from `.env.example`.
2. Set `DATABASE_URL` and `JWT_SECRET`.
3. Set the server-only Supabase Storage variables:
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - `SUPABASE_STORAGE_BUCKET=product-images`
4. Keep the Supabase secret key only in the backend environment. Never put it in frontend code or GitHub.
5. Run `npm install` and `npm start`.

## Admin product images

Admins upload product images from the admin dashboard. The browser sends the selected image to the protected Express admin API; the backend uploads the bytes to Supabase Storage using the server-only secret key and stores the resulting public URL in `products.image_url`.

Supported image types: JPG, PNG, WEBP, GIF. Maximum size: 5 MB.

The backend uses a server-side Supabase secret key for storage operations. Supabase documents secret keys as server-only credentials that bypass RLS and must never be exposed to browsers or source control. See the Supabase API key guidance: https://supabase.com/docs/guides/getting-started/api-keys
