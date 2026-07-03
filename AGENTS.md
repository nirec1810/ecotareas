# EcoTareas

Environmental volunteer brigade task management app. Next.js 16 + Supabase + Tailwind CSS v4.

## Commands

```bash
npm run build    # Verify compilation (no test suite exists)
npm run dev      # Dev server on localhost:3000
npm run lint     # ESLint with next/core-web-vitals + typescript
```

There are no tests. `npm run build` is the only verification step.

## Architecture

- **No `src/` directory** — app, lib, components live at project root
- **Two roles**: `coordinator` (manages tasks, assigns volunteers, sees `/tareas`) and `volunteer` (sees `/mis-tareas`)
- **Middleware** at `proxy.ts` (not `middleware.ts`) enforces role-based route access via `lib/supabase/middleware.ts`
- **Server Actions** in `lib/actions/` — all mutations go through `'use server'` functions, never direct client API calls
- **Zod schemas** in `lib/schemas.ts` for form validation (task, registration, login, password)
- **Types** in `lib/types.ts` — all shared interfaces and type unions

## Supabase

- **Server client**: `lib/supabase/server.ts` — uses `cookies()` from `next/headers`
- **Browser client**: `lib/supabase/client.ts` — `createBrowserClient` from `@supabase/ssr`
- **Auth confirmation is disabled** — users get a session immediately after signup (no email verification flow)
- **Env vars**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` in `.env.local`
- **Storage bucket**: `evidencias` — path pattern `{user_id}/{taskId}/{timestamp}-{filename}`. RLS policies needed for authenticated read + insert to own folder
- **Profile creation**: handled by Supabase DB trigger on auth signup (not in app code). The `profiles` table has `id`, `full_name`, `role`

## Next.js 16 Specifics

This is **NOT** the Next.js from training data. Read `node_modules/next/dist/docs/` before making structural changes.

Key differences observed:
- Middleware exported as named `proxy` function from `proxy.ts` (not default from `middleware.ts`)
- `params` in page components is a `Promise` that must be `await`ed
- `searchParams` in page components is a `Promise` that must be `await`ed

## Conventions

- **UI language**: Spanish (field names, labels, error messages, route paths)
- **Code language**: English (variable names, function names, file names)
- **No comments** in code unless marking incomplete work (`// TODO Sprint X:`)
- **Role checks**: coordinator-only Server Actions call `verificarCoordinator(supabase)` helper
- **Form handling**: Server Actions receive `FormData`, parse with Zod, return `{ success, message, errors? }`

## Gotchas

- Leaflet (`MapaTareas.tsx`) requires importing `leaflet/dist/leaflet.css` in a client component and fixing default icon paths via CDN URLs — Leaflet doesn't bundle icons
- Supabase `.single()` returns `null` on no match — TypeScript needs explicit type assertions for the result
- `revalidatePath` must be called after mutations for ISR pages to update
- The `tasks.status` is the source of truth for operational state; `assignments.status` is for assignment lifecycle (assigned/accepted/rejected)
- `listarTareas` changed signature in Sprint 3: `(page, pageSize, filters?)` — the optional `filters` param must be passed as `undefined` (not omitted) when no filters apply, to maintain type compatibility
