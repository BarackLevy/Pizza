# lib/

Shared utilities and service clients used across the app.

- `supabase/` — Supabase client instances (browser)
- Add `utils/` here for general-purpose helpers (formatting, validation, etc.)

Nothing in this folder should import from `app/` — dependency flow goes lib → app, never the other way.
