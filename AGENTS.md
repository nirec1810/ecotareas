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
- **Two roles**: `coordinator` (manages tasks, assigns volunteers, dashboard, calendar, user admin) and `volunteer` (my tasks, ranking, profile)
- **Middleware** at `proxy.ts` (not `middleware.ts`) enforces role-based route access + `is_active` check via `lib/supabase/middleware.ts`
- **Server Actions** in `lib/actions/` — all mutations go through `'use server'` functions, never direct client API calls
- **Zod schemas** in `lib/schemas.ts` (task, registration, login, password, metrics, profile)
- **Types** in `lib/types.ts` — all shared interfaces and type unions
- **Helpers** in `lib/actions/` (no `'use server'`): `gamification.ts`, `audit.ts` — imported by Server Actions

## Routes

| Route | Access | Sprint |
|-------|--------|--------|
| `/tareas`, `/tareas/nueva`, `/tareas/[id]`, `/tareas/[id]/editar` | Coordinator | 1 |
| `/mis-tareas`, `/mis-tareas/[id]` | Volunteer | 2 |
| `/mapa` | Coordinator | 3 |
| `/dashboard`, `/calendario` | Coordinator | 4 |
| `/perfil`, `/ranking` | Both | 5 |
| `/usuarios` | Coordinator | 5 |

## Supabase

- **Server client**: `lib/supabase/server.ts` — uses `cookies()` from `next/headers`
- **Browser client**: `lib/supabase/client.ts` — `createBrowserClient` from `@supabase/ssr`
- **Auth confirmation is disabled** — users get a session immediately after signup (no email verification flow)
- **Env vars**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` in `.env.local`
- **Storage buckets**:
  - `evidencias` — path `{user_id}/{taskId}/{timestamp}-{filename}`. Authenticated read + insert to own folder.
  - `avatars` — public read, authenticated insert own folder.
- **Profile creation**: handled by Supabase DB trigger on auth signup. Profiles table: `id`, `full_name`, `role`, `avatar_url`, `phone`, `bio`, `is_active`, `points`

## Key tables (beyond auth schema)

- `profiles` — user info + gamification fields
- `tasks` — CRUD with soft-delete via `is_active`
- `assignments` — task-volunteer assignment lifecycle
- `comments`, `evidences` — per-task social features
- `task_metrics` — impact data (trees_planted, waste_kg)
- `task_audit_log` — immutable change history (INSERT + SELECT only)
- `badges`, `user_badges` — gamification thresholds

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
- `listarTareas` signature: `(page, pageSize, filters?)` — pass `undefined` (not omit) when no filters apply
- `get_user_emails()` is a SECURITY DEFINER SQL function in auth schema — never expose service_role key
- `task_audit_log` is INSERT-only from Server Actions — never UPDATE or DELETE programmatically
- `confirmarCompletarTarea` triggers `sumarPuntos(10)` + badge check — must run after metrics insert
- `subirEvidencia` creates file at path `{userId}/{taskId}/...` — bucket RLS must allow this pattern
