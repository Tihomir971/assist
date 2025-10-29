# AGENTS.md

This file provides guidance to agents when working with code in this repository.

- Structured Supabase errors flow through `extractStructuredSupabaseError`; when debugging failed actions inspect the returned `errorTitle`, `errorSuggestion`, and `errorCode` that `createSimpleCRUD` sends back via `fail(...)` for toast rendering ([simple-crud.factory.ts](../../src/lib/utils/simple-crud.factory.ts:45-134), [supabase-error.utils.ts](../../src/lib/server/utils/supabase-error.utils.ts:62-199)).
- Toast deduplication is keyed in `ToastManager.showStructuredError`; if you do not see repeated errors, check the `dedupeKey` logic before assuming the action succeeded ([toast-manager.ts](../../src/lib/utils/toast-manager.ts:113-159)).
- Worker bindings must stay in sync: regenerate types with `pnpm run cf-typegen` whenever you touch `wrangler.jsonc` or Cloudflare env vars; stale definitions manifest as runtime binding exceptions only under the Worker runtime ([package.json](../../package.json:7-19), [wrangler.jsonc](../../wrangler.jsonc:6-18)).