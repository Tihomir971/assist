# RooCode: Workspace-Wide Development Patterns

## 1. Overview

This document outlines the standardized, workspace-wide patterns for building type-safe, maintainable, and consistent CRUD (Create, Read, Update, Delete) interfaces in this SvelteKit project. By following these guides, you can reduce boilerplate code by up to 90% and accelerate development time significantly.

The two primary patterns are:
1.  **Smart CRUD**: For managing single entities.
2.  **Smart Linked Tables**: An extension for managing a primary entity along with its related (one-to-many) data.

These patterns leverage a core set of utilities:
- **Services**: For abstracting database logic.
- **Payload Builders**: For safely constructing API payloads from form data.
- **Declarative UI Components**: `SmartForm` and `SmartRelatedTable` generate complex UI from simple configurations.
- **Zod Schemas**: As the single source of truth for data shapes and validation.

---

## 2. Pattern 1: Smart CRUD for Single Entities

Use this pattern for standard CRUD pages (e.g., managing users, simple lookup tables).

### Architecture

1.  **Service Class**: Implements `CRUDService` for database operations (`src/lib/services/supabase/{entity}.service.ts`).
2.  **Payload Builder**: An instance of `SmartPayloadBuilder` to handle form data transformation (`.../[[id]]/entity.payload.ts`).
3.  **Server Logic**: A `+page.server.ts` file that uses a `createSimpleCRUD` factory for actions and a `load` function to fetch data.
4.  **Frontend Form**: A `+page.svelte` file that uses the `SmartForm` component, configured with `createFormConfig`.

### File Structure

```
src/routes/(app)/your-route/[[id]]/
├── +page.server.ts         # Server load and actions
├── +page.svelte            # Main form page
└── entity.payload.ts       # Main entity payload builder
```

### Implementation Steps

1.  **Create the Service**: Implement the `CRUDService` interface in `src/lib/services/supabase/your-entity.service.ts`.
2.  **Create the Payload Builder**: In `.../[[id]]/entity.payload.ts`, create an instance of `SmartPayloadBuilder`, linking it to your Zod insert/update schemas and defining any defaults or transformers.
    ```typescript
    // src/routes/(app)/your-route/[[id]]/entity.payload.ts
    import { yourEntityInsertSchema, yourEntityUpdateSchema } from '$lib/types/supabase.zod.schemas';
    import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

    export const yourEntityPayloadBuilder = new SmartPayloadBuilder(
        { schema: yourEntityInsertSchema, defaults: { is_active: true } },
        { schema: yourEntityUpdateSchema }
    );
    ```
3.  **Implement Server Actions**: In `+page.server.ts`, use `createSimpleCRUD` to generate `upsert` and `delete` actions. The `load` function should fetch the entity for editing and prepare the `superValidate`d form.
    ```typescript
    // src/routes/(app)/your-route/[[id]]/+page.server.ts
    import { YourEntityService } from '$lib/services/supabase/your-entity.service';
    import { createSimpleCRUD } from '$lib/utils/simple-crud.factory';
    import { yourEntityPayloadBuilder } from './entity.payload';
    import { yourEntityInsertSchema } from '$lib/types/supabase.zod.schemas';

    export const load = async ({ params, locals: { supabase } }) => { /* ... load entity and return form ... */ };

    const crud = createSimpleCRUD(
        'YourEntity',
        (supabase) => new YourEntityService(supabase),
        yourEntityPayloadBuilder,
        yourEntityInsertSchema
    );

    export const actions = {
        upsert: crud.upsert,
        delete: crud.delete
    };
    ```
4.  **Create the Frontend Form**: In `+page.svelte`, use `SmartForm`. Configure its appearance and field layout with `createFormConfig`.
    ```svelte
    <!-- src/routes/(app)/your-route/[[id]]/+page.svelte -->
    <script lang="ts">
        import SmartForm from '$lib/components/forms/SmartForm.svelte';
        import { createFormConfig } from '$lib/utils/form-config.builder';
        import { yourEntityInsertSchema } from '$lib/types/supabase.zod.schemas';

        let { data } = $props();

        const formConfig = createFormConfig()
            .title('Entity Details')
            .field('name', { span: 12, placeholder: 'Enter name' })
            .field('sequence', { type: 'number', span: 6, step: 1 })
            .build();
    </script>

    <SmartForm
        form={data.form}
        schema={yourEntityInsertSchema}
        action="?/upsert"
        config={formConfig}
        deleteAction="?/delete"
    />
    ```

---

## 3. Pattern 2: Smart Linked Tables for Related Data

Use this pattern when a primary entity has one-to-many relationships that need to be displayed and managed on the same page (e.g., a Product Category with its Channel Mappings and Price Rules).

### Architecture

This pattern extends **Smart CRUD** by introducing:
1.  **Related Table Configs**: Declarative configurations for each linked table, created with `createRelatedTableConfig` (`.../[[id]]/related-configs.ts`).
2.  **SmartRelatedTable Component**: A reusable Svelte component that renders a data table with search, sorting, pagination, and CRUD actions based on a table config.
3.  **SmartRelatedDrawer Component**: A drawer that opens from the `SmartRelatedTable` and uses `SmartForm` internally to edit related items.
4.  **Expanded Server Logic**: The `+page.server.ts` must load the main entity AND all related data, and provide actions for all entities.

### File Structure

```
src/routes/(app)/your-route/[[id]]/
├── +page.server.ts               # Server load and actions for ALL entities
├── +page.svelte                  # Main form + related tables
├── entity.payload.ts             # Main entity payload builder
├── related-entity-A.payload.ts   # Payload builder for related entity A
├── related-entity-B.payload.ts   # Payload builder for related entity B
└── related-configs.ts            # Table configurations for all related entities
```

### Implementation Steps

1.  **Follow Pattern 1** for the main entity.
2.  **Create Payloads for Related Entities**: For each related entity, create a `SmartPayloadBuilder` instance in its own file (e.g., `price-rule.payload.ts`).
3.  **Define Related Table Configurations**: In `.../[[id]]/related-configs.ts`, use `createRelatedTableConfig` to define the UI and behavior for each linked table.
    ```typescript
    // src/routes/(app)/your-route/[[id]]/related-configs.ts
    import { createRelatedTableConfig, columnTypes } from '$lib/utils/related-table-config.builder';
    import { priceRulesInsertSchema } from '$lib/types/supabase.zod.schemas';

    export const priceRulesConfig = createRelatedTableConfig()
        .title('Price Rules')
        .column(columnTypes.text('name', 'Name'))
        .column(columnTypes.boolean('is_active', 'Active'))
        .formSchema(priceRulesInsertSchema)
        .actions('?/priceRuleUpsert', '?/priceRuleUpsert', '?/priceRuleDelete')
        .parentIdField('m_product_category_id') // Foreign key to parent
        .build();
    ```
4.  **Update Server Logic**:
    - In the `load` function, fetch the main entity and all related data in parallel using `Promise.all`.
    - Create `superValidate`d forms for the main entity and EACH related entity.
    - Create `createSimpleCRUD` actions for the main entity and EACH related entity. Expose them all in the `actions` object.
5.  **Update the Frontend**:
    - In `+page.svelte`, below the main `SmartForm`, add a `SmartRelatedTable` component for each relationship.
    - Pass the corresponding config, data, form, and lookup data to each component.
    ```svelte
    <!-- src/routes/(app)/your-route/[[id]]/+page.svelte -->
    <script lang="ts">
        import SmartForm from '$lib/components/forms/SmartForm.svelte';
        import SmartRelatedTable from '$lib/components/forms/SmartRelatedTable.svelte';
        import { priceRulesConfig } from './related-configs';
        // ... other imports
        let { data } = $props();
    </script>

    <!-- Main Entity Form -->
    <SmartForm {...mainFormProps} />

    <!-- Related Tables -->
    {#if data.entity?.id}
        <div class="mt-4 space-y-4">
            <SmartRelatedTable
                config={priceRulesConfig}
                items={data.priceRules}
                validatedForm={data.formPriceRules}
                parentId={data.entity.id}
                lookupData={{ priceFormulas: data.priceFormulas }}
            />
            <!-- ... other related tables ... -->
        </div>
    {/if}
    ```

---

## 4. Best Practices

- **Single Source of Truth**: Use `supabase.zod.schemas.ts` as the definitive source for data structures. All types (`-ts` files), forms, and payloads derive from this.
- **Parallel Data Fetching**: In `load` functions, always use `Promise.all` to fetch data concurrently for better performance.
- **Co-location**: Keep entity-specific files (payloads, configs) within the route directory they are used in. This makes routes self-contained and easier to manage.
- **Service Layer Abstraction**: All database logic MUST be in a `service` class. Server `load` and `action` functions should not contain direct `supabase` calls, but rather call methods on a service instance.
- **Declarative UI**: Prefer configuring `SmartForm` and `SmartRelatedTable` over building custom UI. This ensures consistency and reduces code.