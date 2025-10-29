# Project Overview

## Product Vision

The application is a SvelteKit + Supabase backoffice targeting fast CRUD workflows over business data. It must deliver:

- A modern, responsive UI with intuitive navigation and accessible interactions.
- End-to-end CRUD flows backed by Supabase Auth, Postgres storage, and storage buckets.
- Consistent design language using Shadcn-Svelte primitives with Tailwind CSS.

## Problem Domains

- Centralized management of catalog entities (products, attributes, price lists, channel mappings).
- Streamlined internal tooling for document generation and synchronization workflows.
- Alignment between SvelteKit routing/layout patterns and Supabase service abstractions.

## Experience Goals

- Smooth load times and predictable navigation (leveraging SvelteKit streaming + invalidation).
- Accessible components with preserved focus states and descriptive page titles.
- Trustworthy data handling with explicit error reporting and recoverable forms.

## Project Requirements

- Supabase handles authentication, database persistence, and storage.
- Forms use `sveltekit-superforms` + Zod for type-safe validation.
- Shared utilities (`SmartPayloadBuilder`, `createSimpleCRUD`, list loaders) stay canonical across modules.
- Codebase remains maintainable and type-safe (pnpm, TypeScript, ESLint, Prettier, Knip).