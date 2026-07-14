# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint
```

There is no test suite configured in this repo.

## Architecture

This is a Next.js **App Router** admin panel for "NeighborUp" (a community app), used to manage users, moderation, and platform operations. It talks to a Supabase backend.

- **Routing**: every route under `app/*/page.tsx` is a flat, top-level admin section (e.g. `app/moderation`, `app/verification`, `app/subscriptions`), plus nested routes under `app/users/` (`kids`, `business`). There is no route grouping/parallel routes in use — new admin sections should follow the same flat `app/<section>/page.tsx` pattern.
- **Navigation is hardcoded**: `components/Sidebar.tsx` contains a single `nav` array grouping routes into sections (OVERVIEW, USERS, TRUST & SAFETY, COMMUNITY, MONETIZATION, OPERATIONS). Adding a new page means adding both the `app/<name>/page.tsx` file and a corresponding entry in this `nav` array.
- **Layout**: `app/layout.tsx` renders a fixed dark-mode shell — `Sidebar` + scrollable `main` — around every page. There's no per-page layout variation currently.
- **UI kit**: `components/ui/*` are shadcn-generated primitives (button, card, table, dropdown-menu, etc.) configured via `components.json` (style `base-nova`, base color `neutral`, no class prefix). Use `npx shadcn add <component>` to pull in new primitives rather than hand-rolling them. Compose UI with the `cn()` helper (`lib/utils.ts`, clsx + tailwind-merge) for conditional class names.
- **Styling**: Tailwind v4 with CSS-variable-based theming in `app/globals.css` (`@theme inline` + `:root`/`.dark` OKLCH variables). The app is currently hardcoded into dark mode via literal `bg-gray-950`/`text-white` classes in `app/layout.tsx`, layered on top of the shadcn theme tokens — be consistent with the existing gray-950/gray-900/gray-800 dark palette when styling new pages rather than introducing the light theme tokens.
- **Data layer**: `lib/supabase.ts` exports `supabaseAdmin`, a Supabase client built with the **service role key** — it bypasses Row Level Security and must only be used in server-side code (Server Components, Route Handlers), never imported into a `'use client'` file.
- **Current state**: most section pages (dashboard, users, etc.) are still static UI scaffolding with placeholder text like "Connect Supabase to load data." — they are not yet wired to `supabaseAdmin`. When implementing a section, treat the existing page as a layout/markup reference and wire in real data fetching.
- **Env vars** (`.env.local`, not committed): `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SECRET`. There is no auth middleware wired up yet despite `ADMIN_SECRET` being defined.
