# RooCode: Supabase Service Pattern

## 1. Overview

This document outlines the standardized pattern for creating Supabase service classes that provide type-safe CRUD (Create, Read, Update, Delete) operations and lookup data methods. This pattern ensures consistency, reusability, and clear separation of concerns for database interactions within the SvelteKit project.

The primary goal is to:
- Abstract Supabase database logic into dedicated service classes.
- Provide standard CRUD operations for single entities.
- Implement `getLookup()` methods for common select/dropdown options.
- Ensure type safety using Zod schemas and Supabase types.

## 2. Architecture

1.  **Service Class**: A TypeScript class implementing `CRUDService` (or a subset of its methods) for a specific Supabase table.
2.  **Entity Types**: TypeScript types (`Entity`, `EntityCreate`, `EntityUpdate`, `EntityLookup`) derived from `supabase.types.ts` for strong typing.
3.  **Supabase Client Injection**: Services receive the Supabase client via their constructor.

## 3. File Structure

```
src/lib/services/supabase/
├── base/
│   └── crud.service.ts     # Base CRUDService interface
├── your-entity.service.ts  # Your specific service implementation
└── index.ts                # Exports all services
```

## 4. Implementation Steps

### Step 1: Define Entity Types

For each service, define the necessary types in the service file, typically at the top.

```typescript
// src/lib/services/supabase/your-entity.service.ts
import type { Tables } from '$lib/types/supabase.types';

export type YourEntity = Tables<'your_table_name'>;
export type YourEntityCreate = Omit<YourEntity, 'id' | 'created_at' | 'updated_at'>;
export type YourEntityUpdate = Partial<YourEntityCreate>;
export type YourEntityLookup = { value: number; label: string }; // For lookup data
```

### Step 2: Implement the Service Class

Create the service class in `src/lib/services/supabase/your-entity.service.ts`, implementing the `CRUDService` interface and including a `getLookup` method.

```typescript
// src/lib/services/supabase/your-entity.service.ts
import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service'; // Ensure this path is correct

export type YourEntity = Tables<'your_table_name'>;
export type YourEntityCreate = Omit<YourEntity, 'id' | 'created_at' | 'updated_at'>;
export type YourEntityUpdate = Partial<YourEntityCreate>;
export type YourEntityLookup = { value: number; label: string };

export class YourEntityService implements CRUDService<YourEntity, YourEntityCreate, YourEntityUpdate> {
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<YourEntity | null> {
		const { data, error } = await this.supabase
			.from('your_table_name')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch YourEntity: ${error.message}`);
		return data;
	}

	async create(data: YourEntityCreate): Promise<YourEntity> {
		const { data: newYourEntity, error } = await this.supabase
			.from('your_table_name')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create YourEntity: ${error.message}`);
		if (!newYourEntity) throw new Error('Failed to create YourEntity: No data returned');
		return newYourEntity;
	}

	async update(id: number, data: YourEntityUpdate): Promise<YourEntity> {
		const { data: updatedYourEntity, error } = await this.supabase
			.from('your_table_name')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update YourEntity: ${error.message}`);
		if (!updatedYourEntity) throw new Error('Failed to update YourEntity: No data returned');
		return updatedYourEntity;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('your_table_name').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete YourEntity: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<YourEntity[]> {
		let query = this.supabase.from('your_table_name').select('*');

		// Example filter:
		if (filters?.is_active !== undefined) {
			query = query.eq('is_active', filters.is_active as boolean);
		}

		const { data, error } = await query.order('your_sort_column'); // Replace with actual sort column
		if (error) throw new Error(`Failed to list YourEntities: ${error.message}`);
		return data || [];
	}

	async getLookup(): Promise<YourEntityLookup[]> {
		const { data, error } = await this.supabase
			.from('your_table_name')
			.select('value:id, label:your_label_column') // Replace with actual label column
			.eq('is_active', true)
			.order('your_label_column'); // Replace with actual label column

		if (error) throw new Error(`Failed to load YourEntity lookup: ${error.message}`);
		return data || [];
	}

    // Add any specific methods here, e.g., getAttributeOptions for AttributeService
}
```

**Specific Service Implementations:**

-   **PartnerService**:
    -   **Table**: `c_bpartner`
    -   **Label Column**: `display_name`
    -   **Sort Column**: `display_name`
    -   **Additional Filters in `list`**: `iscustomer`, `isvendor`
-   **AttributeService**:
    -   **Table**: `m_attribute`
    -   **Label Column**: `name`
    -   **Sort Column**: `name`
    -   **Additional Method**: `getAttributeOptions(attributeId: number): Promise<AttributeOptionLookup[]>`
-   **AttributeOptionService**:
    -   **Table**: `m_attribute_option`
    -   **Label Column**: `name`
    -   **Sort Columns**: `sort_order`, then `name`
    -   **Additional Method**: `getByAttributeId(attributeId: number): Promise<AttributeOption[]>`

### Step 3: Update `src/lib/services/supabase/index.ts`

Export the newly created service classes from `src/lib/services/supabase/index.ts` to make them easily importable throughout the application.

```typescript
// src/lib/services/supabase/index.ts
export { PartnerService } from './partner.service';
export { AttributeService } from './attribute.service';
export { AttributeOptionService } from './attribute-option.service';
// ... other services
```

### Step 4: Integrate Lookup Data in `+page.server.ts`

In `+page.server.ts` files where lookup data is needed (e.g., for forms), instantiate the services and fetch the lookup data using `Promise.all` for concurrent fetching.

```typescript
// src/routes/(app)/your-route/[[id]]/+page.server.ts (or any other +page.server.ts)
import { PartnerService } from '$lib/services/supabase/partner.service';
import { AttributeService } from '$lib/services/supabase/attribute.service';
import { CategoryService } from '$lib/services/supabase/category.service'; // Example existing service
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  // ... existing load logic ...

  const [partners, categories, attributes] = await Promise.all([
    new PartnerService(supabase).getLookup(),
    new CategoryService(supabase).getLookup(),
    new AttributeService(supabase).getLookup()
  ]);

  return {
    // ... existing return data ...
    lookupData: { partners, categories, attributes }
  };
};
```

## 5. Best Practices

-   **Single Source of Truth**: All data structures and validation should originate from `supabase.zod.schemas.ts` and `supabase.types.ts`.
-   **Service Layer Abstraction**: All direct Supabase calls must be encapsulated within service methods. `+page.server.ts` files should interact with services, not directly with `supabase` client.
-   **Parallel Data Fetching**: Always use `Promise.all` when fetching multiple independent lookup datasets in `load` functions to improve performance.
-   **Type Safety**: Leverage TypeScript types (`Entity`, `EntityCreate`, `EntityUpdate`, `EntityLookup`) to ensure strong typing throughout the service layer.
-   **Error Handling**: Implement robust error handling within service methods, throwing descriptive errors that can be caught and managed by the calling context.
-   **Standardized Lookup Format**: Ensure `getLookup()` methods consistently return data in the `{ value: number; label: string }` format.