# GallaMandi frontend API configuration

The frontend now uses `js/config.js` to select the API automatically:

- `localhost` / `127.0.0.1` → `http://localhost:5000`
- Any deployed hostname → `https://gallamandi.onrender.com`

This removes the need to manually edit API URLs before local testing or deployment.

Do not put database credentials or Supabase secret keys in this frontend.
