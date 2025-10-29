# Technology Context

## Core Stack

- **Framework:** SvelteKit (Svelte&nbsp;5 runtime)
- **Backend:** Supabase (Auth, Postgres, Storage, Edge Functions)
- **UI Library:** Shadcn-Svelte with Tailwind CSS
- **Forms:** sveltekit-superforms + Zod validation
- **Networking:** `ky` HTTP client
- **Language & Tooling:** TypeScript, pnpm, Vite HMR, ESLint, Prettier, Knip

## Project Structure Primer

```
src/
├ lib/             # Shared components, utilities, stores
│ ├ server/        # Server-only utilities (`$lib/server` alias)
├ params/          # Route parameter matchers
├ routes/          # SvelteKit pages + endpoints
├ app.html         # Base HTML shell
static/            # Public assets
package.json       # Scripts and dependencies
svelte.config.js   # Adapter + preprocess config
tsconfig.json      # TypeScript settings
vite.config.ts     # Vite plugins
```

Key conventions:

- `$lib` and `$lib/server` aliases split universal vs. server-only code.
- Route groups (e.g. `(app)`) organize layouts without affecting URLs.
- Cloudflare worker output lives in `.svelte-kit/cloudflare/_worker.js` after build.

## Development Setup

- Package manager: **pnpm** (lockfile enforced).
- Formatting: **Prettier** with Tailwind plugin and tabs / 100-char line width.
- Linting: **ESLint** flat config (TypeScript + Svelte).
- Type checking: `pnpm run check` (syncs kit manifests before `svelte-check`).
- Optional analyzers: `pnpm run knip` for unused exports/deps.

## Operational Constraints

- Target modern evergreen browsers; rely on Web APIs available in edge runtimes.
- Accessibility is non-negotiable: proper titles, focus management, ARIA labelling.
- Performance goals: fast first paint, lightweight bundles, responsive interactions.

## Advanced SvelteKit Usage

- **Routing:** Rest (`[...slug]`) and optional (`[[lang]]`) parameters, matcher-based validation, route specificity ordering, encoded segments (`[x+nn]`).
- **Layouts:** Route groups `(group)` and layout breakouts (`+page@(group).svelte`) to opt into specific layout trees.
- **Hooks:** 
  - `handle` for auth/session wiring.
  - `handleFetch` for Supabase session propagation.
  - `handleError` for structured logging.
- **Error Handling:** Custom `+error.svelte` plus typed `App.Error` interface.
- **Link Directives:** Preload control, scroll/replace semantics via `data-sveltekit-*`.
- **Service Workers:** Auto-registered when `src/service-worker.js` present; `$service-worker` module exposes asset manifest.
- **Server-only Modules:** `.server` filename suffix or `$lib/server` location keeps secrets off the client.
- **Snapshots & Shallow Routing:** Preserve form state across navigation and push modal dialogs into history safely.
- **Packaging:** `@sveltejs/package` workflow for shareable component bundles.

## Platform Web APIs

SvelteKit leans on web standards:

- Fetch / Request / Response in load functions and endpoints.
- FormData for native form posts.
- Streams (Readable/Writable/Transform) for large responses.
- URL + URLSearchParams for routing and filtering.
- Web Crypto for CSP nonces and uuid helpers.

## Reference

Consult this document alongside:

- [.roo/docs/project-overview.md](./project-overview.md)
- [.roo/docs/system-patterns.md](./system-patterns.md)
- [.roo/docs/project-progress.md](./project-progress.md)