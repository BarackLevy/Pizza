---
name: project-architecture
description: Stack, brand config, folder structure, and Supabase setup for the Pizza Eilat catering site
metadata:
  type: project
---

Next.js 16.2.6 (App Router, Turbopack) with React 19 and TypeScript. Tailwind CSS v4 via `@tailwindcss/postcss`.

**Brand tokens** defined in `app/globals.css` inside `@theme {}`:
- `--color-brand: #c8102e` → `bg-brand`, `text-brand`, `border-brand`
- `--color-brand-hover: #dc2626`
- `--color-background: #0a0a0a`, `--color-foreground: #ffffff`
- `--font-heebo: var(--font-heebo-next), 'Heebo', sans-serif`

**Why:** Single source of truth — change color/font in one place, propagates everywhere.

**Heebo font** loaded via `next/font/google` (self-hosted, no Google CDN request) with subsets `["latin", "hebrew"]` and weights 400/500/700/800/900. CSS variable `--font-heebo-next` is injected on `<html>` via `className={heebo.variable}`. RTL: `<html lang="he" dir="rtl">`.

**Folder structure:**
- `lib/supabase/client.ts` — browser Supabase client (reads `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `components/ui/` — reusable UI primitives (empty, ready to fill)
- `types/` — shared TypeScript interfaces (empty, ready to fill)
- `app/components/` — existing app-specific components (PizzaLogo.tsx)

**Supabase:** `@supabase/supabase-js` installed. Env var template at `.env.local.example`. No real keys anywhere.

**How to apply:** When adding features, use `bg-brand` / `text-brand` Tailwind classes for the red accent. Put reusable primitives in `components/ui/`, shared types in `types/`, any DB/API utils in `lib/`.
