# Deployment Guide — Vercel

## Prerequisites

- A Vercel account connected to your GitHub repo
- A Supabase project with the schema applied (see `context/schema/full-schema.sql`)

## 1. Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import this GitHub repository
3. Vercel auto-detects the Vite framework from `vercel.json`
4. No build settings need to be changed — defaults work:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

## 2. Environment Variables

Set these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | `https://<your-project-id>.supabase.co` | From Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | From Supabase → Settings → API → `anon` `public` key |

Both variables **must** have the `VITE_` prefix so Vite exposes them to the client bundle at build time.

Set them for **all environments** (Production, Preview, Development) unless you have separate Supabase projects per environment.

## 3. Supabase Configuration

### Auth Redirect URLs

In **Supabase → Authentication → URL Configuration**:

1. **Site URL**: Set to your Vercel production URL (e.g., `https://momentum-app.vercel.app`)
2. **Redirect URLs**: Add all of the following:
   - `https://momentum-app.vercel.app/**` (production)
   - `https://*-your-vercel-team.vercel.app/**` (preview deployments)
   - `http://localhost:5173/**` (local development)

Replace `momentum-app` with your actual Vercel project name.

### Row Level Security

Ensure all tables have RLS enabled with `user_id = auth.uid()` policies. The app uses the Supabase anon key with RLS — there is no server-side API. All data access is client-side through the Supabase JS SDK, protected by RLS policies.

## 4. Deploy

After setting environment variables, trigger a deploy:

- Push to `main` for production
- Push to any branch for a preview deployment

## 5. Post-Deploy Checklist

- [ ] Visit the production URL — should redirect to `/login`
- [ ] Sign up a test account
- [ ] Complete onboarding (select 3+ pillars)
- [ ] Verify redirect to `/today` after onboarding
- [ ] Create a goal, action, and habit
- [ ] Check that the calendar sidebar loads
- [ ] Open Life Map (header button or Cmd+L)
- [ ] Verify journal prompt appears after 8 PM (or test by temporarily changing the hour check)

## Architecture Notes

This is a **pure client-side SPA** — there are no Vercel serverless functions or API routes. All data flows through the Supabase JS client directly from the browser:

```
Browser → Supabase JS SDK → Supabase (Postgres + Auth + RLS)
```

The `vercel.json` configures a catch-all rewrite so that React Router handles all paths client-side.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page after deploy | Check that both `VITE_` env vars are set in Vercel and redeploy |
| Auth redirects to wrong URL | Update Site URL and Redirect URLs in Supabase Auth settings |
| "Invalid API key" in console | Verify `VITE_SUPABASE_ANON_KEY` matches your Supabase project's anon key |
| 404 on page refresh | Verify `vercel.json` has the SPA rewrite rule |
| Preview deploys fail auth | Add the preview URL pattern to Supabase redirect URLs |
