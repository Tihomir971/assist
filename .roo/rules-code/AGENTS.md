# AGENTS.md

This file provides guidance to agents when working with code in this repository.

- All Supabase mutations must flow through service classes; routes should never call `supabase.from(...)` directly so that shared error handling and lookups remain consistent ([03-supabase-service-pattern.md](../rules/03-supabase-service-pattern.md:31)).
- `SmartPayloadBuilder` already strips `id/created_at/updated_at` for create calls and merges defaults; bypassing it causes duplicate keys or missing defaults in Supabase payloads ([smart-payload.builder.ts](../../src/lib/utils/smart-payload.builder.ts:64-81)).
- `createSimpleCRUD` relies on the service response to hydrate `form.data`; if you return custom payloads, downstream `SmartForm` components lose reactive values and delete actions break ([simple-crud.factory.ts](../../src/lib/utils/simple-crud.factory.ts:35-136)).
- List pages must register an `event.depends('<namespace>:<entity>')` key that matches the `invalidate(...)` call from related drawers; otherwise table filters stop refreshing ([crm contacts +page.server.ts](../../src/routes/(app)/crm/contacts/+page.server.ts:12-15)).
- Related tables rendered via `SmartRelatedTabs` need an `onRefresh` handler that calls `invalidate(...)`; without it delete operations leave ghost rows ([05-smart-split-layout-pattern.md](../rules/05-smart-split-layout-pattern.md:239)).
- Keep Cloudflare Worker types up to date by running `pnpm run cf-typegen` whenever `wrangler.jsonc` changes; the custom bindings compile against `.svelte-kit/cloudflare/_worker.js` ([package.json](../../package.json:7-19), [wrangler.jsonc](../../wrangler.jsonc:6-18)).