# Ideias Mídias — Web

Front-end for the Ideias Mídias platform: a bilingual (PT/EN) public
marketing/portfolio website plus a protected admin panel for managing all content.

Built with **Next.js 16** (App Router), **React 19**, **TypeScript** and
**Tailwind CSS 4**. It talks to the [Ideias Mídias backend](../ideias_midias_backend).

## Features

- Public site: home page, dynamic section pages, portfolio, media galleries,
  location maps, contact links
- Admin panel: dashboard plus full CRUD for site settings, home cards, sections,
  categories, items & media, portfolio projects & media, content blocks, contact
  methods, theme settings and admin users
- Bilingual UI (PT/EN) via `next-intl`, with locale-prefixed routing
- Dynamic theming driven by backend theme settings (CSS variables)
- Auth flow with session guard for protected routes

## Tech stack

| Concern           | Choice                              |
|-------------------|-------------------------------------|
| Framework         | Next.js 16 (App Router)             |
| UI                | React 19, Tailwind CSS 4            |
| Data fetching     | TanStack Query                      |
| Forms/validation  | react-hook-form + Zod              |
| i18n              | next-intl (`en`, `pt`)             |
| Maps              | MapLibre GL                         |
| Animation         | Framer Motion                       |
| Tests             | Vitest                              |

## Prerequisites

- Node.js 20+ (Node 22 recommended)
- A running instance of the backend API

## Environment variables

Create a `.env.local` (see `.env.example`):

| Variable                    | Description                                              | Example |
|-----------------------------|----------------------------------------------------------|---------|
| `NEXT_PUBLIC_API_BASE_URL`  | Base URL of the backend API (including `/api` if used)   | `http://localhost:8080/api` |
| `NEXT_PUBLIC_BACKEND_URL`   | Backend origin used to resolve uploaded media URLs       | `http://localhost:8080` |

These are also used by `next.config.ts` to allow-list remote image hosts, so they
must be set at build time for production image optimization to work.

## Getting started

```bash
npm install
cp .env.example .env.local   # then edit the values
npm run dev
```

Open <http://localhost:3000>. You will be redirected to a locale prefix (e.g.
`/en` or `/pt`). The admin panel lives under `/<locale>/admin`.

## Scripts

| Command              | Description                          |
|----------------------|--------------------------------------|
| `npm run dev`        | Start the dev server                 |
| `npm run build`      | Production build                     |
| `npm run start`      | Serve the production build           |
| `npm run lint`       | Run ESLint                           |
| `npm run test`       | Run the Vitest suite once            |
| `npm run test:watch` | Run Vitest in watch mode             |

## Testing

Unit tests cover the pure utility/business logic (URL helpers, error mapping,
contact-link building, localization helpers). They run in a Node environment with
no browser needed:

```bash
npm run test
```

Test files live next to the code they cover as `*.test.ts`.

## Project structure

```
src/
  app/[locale]/        App Router routes (public site + /admin)
  features/<feature>/  feature-sliced modules (api, components, schema, types, utils)
  components/          shared UI and layout components
  lib/                 api client, auth, theme, media, helpers
  i18n/                next-intl routing/config
  messages/            en.json / pt.json translation catalogs
```
