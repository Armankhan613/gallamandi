# GallaMandi PostgreSQL setup

1. Create the Supabase project.
2. Run `schema.sql` in Supabase SQL Editor.
3. Copy `.env.example` to `.env`.
4. In Supabase click **Connect**, choose the **Session pooler** connection string for a persistent Node.js backend, and put it in `DATABASE_URL`.
5. Keep `JWT_SECRET` the same as the secret used by the deployed frontend/backend if you are trying to preserve existing login tokens; otherwise generate a new strong secret.
6. Run `npm install` and then `node scripts/test-db.js`.
7. Start the API with `npm run dev` or `npm start`.

Do not commit `.env` or the database password to GitHub.


### Admin image uploads

The admin product editor uploads images through the Express backend into the `product-images` Supabase Storage bucket. Set `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and `SUPABASE_STORAGE_BUCKET` in the backend `.env`. The secret key must remain server-side and must never be placed in frontend code.
