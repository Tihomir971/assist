# AGENTS.md

This file provides guidance to agents when working with code in this repository.

- Static type checks must go through `pnpm run check`; the script syncs kit manifests before running `svelte-check`, so skipping it leaves stale type information ([package.json](package.json:10-14)).
- There is **no automated test suite** (no `test`/`vitest` scripts, `tests/` absent); rely on `check`, `lint`, and targeted manual flows.
- CRUD pages must follow the Smart CRUD stack: Supabase service + `SmartPayloadBuilder` + `createSimpleCRUD` factory + `SmartForm`; treat [01-development-patterns.md](.roo/rules/01-development-patterns.md:19) as the contract.
- Any list views should be wired through `createListPageLoader` so filters invalidate correctly; always add `event.depends(...)` as shown in [crm contacts `+page.server.ts`](src/routes/(app)/crm/contacts/+page.server.ts:12) and configure filters via `DataTableConfigBuilder` ([02-smart-list-page-pattern.md](.roo/rules/02-smart-list-page-pattern.md:45)).
- Supabase access lives behind service classes implementing `CRUDService`; generate lookups via `getLookup()` returning `{ value, label }` pairs and keep database types sourced from `@tihomir971/assist-shared` ([03-supabase-service-pattern.md](.roo/rules/03-supabase-service-pattern.md:31)).
- When adding related data drawers, mount them inside `SmartSplitLayout` tabs and supply an `onRefresh` that calls `invalidate(...)`; otherwise deletes won’t visually disappear ([05-smart-split-layout-pattern.md](.roo/rules/05-smart-split-layout-pattern.md:240), [.roo/rules/01-development-patterns.md](.roo/rules/01-development-patterns.md:188)).
- Channel-mapping UI is just the curation layer; the Hono-based sync worker reads from `c_channel_map_*`, so never mutate mapping tables outside those patterns ([07-channel-mapping-pattern.md](.roo/rules/07-channel-mapping-pattern.md:1)).
- Formatting is nonstandard: Prettier uses tabs, 100-char wrap, Tailwind plugin alignment, and runs on `.svelte` files via custom parser settings ([.prettierrc](.prettierrc:1-21)). Always finish with `pnpm run lint` to execute the chained Prettier check followed by ESLint ([package.json](package.json:15-16)).
- The Svelte MCP server must be used for Svelte questions: call `list-sections` first, analyze `use_cases`, then fetch every needed section with `get-documentation`; whenever you produce Svelte code, run `svelte-autofixer` until clean before replying, and offer `playground-link` only if the user asks for a playground and the code wasn’t written to their files.
- Documentation entry points live under `.roo/docs/` (for context) and `.roo/rules/` (for implementation patterns):
  - Overview & progress: [`project-overview.md`](.roo/docs/project-overview.md), [`project-progress.md`](.roo/docs/project-progress.md)
  - Stack & architecture: [`tech-context.md`](.roo/docs/tech-context.md), [`system-patterns.md`](.roo/docs/system-patterns.md)
  - Migrations & references: [`zod-migration.md`](.roo/docs/zod-migration.md), [`unified-filtering-upgrade.md`](.roo/docs/unified-filtering-upgrade.md), [`zag-tree-collection.llm.md`](.roo/docs/zag-tree-collection.llm.md)
  - Development patterns: [`01-development-patterns.md`](.roo/rules/01-development-patterns.md) through [`07-channel-mapping-pattern.md`](.roo/rules/07-channel-mapping-pattern.md) cover Smart CRUD, list pages, split layouts, pricing rules, and synchronization contracts.
- When documentation is outdated or missing, always offer to add/update/remove the relevant `.roo/docs` or `.roo/rules` entry as part of the task so the knowledge base stays current for other agents.
- Must ask for clarifications on user input if you are not 100% sure what user wants.
- Must concentrate only on work you get instructions. If coding agent has suggestions it should ask user for approval.