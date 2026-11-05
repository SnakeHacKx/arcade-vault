# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault: a platform to play games online and compete for the highest score (README is in Spanish). The project follows spec-driven development using the `/spec` and `/spec-impl` skills, installed via `npx skills@latest add Klerith/fernando-skills`. Currently it is an untouched Create Next App scaffold (`app/layout.tsx`, `app/page.tsx`); no game, scoring, or persistence code exists yet.

## Commands

- `npm run dev` — dev server (<http://localhost:3000>)
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`)
- No test runner is configured.

## Next.js version warning

Next 16.4.5 / React 19.3 with breaking changes vs. training data (see `AGENTS.md`). Before writing code, read the relevant guide in `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`, `04-community`). `next dev` regenerates the `AGENTS.md` block; commit it rather than removing it.

## Architecture notes

- App Router only (`app/`). Path alias `@/*` maps to the repo root.
- `next.config.ts` enables non-default settings that affect how pages must be written: `cacheComponents: true`, `partialPrefetching: true`, and `experimental.agentFeedback`. Check the docs for how `cacheComponents` changes data fetching/caching before adding dynamic routes or data access.
- Tailwind v4 is wired through Turbopack: `next.config.ts` has a `turbopack.rules` entry running `@tailwindcss/turbopack` on `*.css`; styles are in `app/globals.css` (`@import "tailwindcss"`, theme tokens via `@theme inline`, light/dark via `prefers-color-scheme`). There is no `postcss.config` and no `tailwind.config`.
- `app/layout.tsx` uses the globally generated `LayoutProps<"/">` type (no import) and loads Geist fonts via `next/font/google`.
