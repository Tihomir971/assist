# UOM Implementation Plan for m_product_attribute

## Overview
Add Unit of Measure (UOM) support to product attributes for numeric, single_select, and multi_select attribute types.

## Phase 1: Database Schema Changes

### Step 1: Database Migration Script

**IMPORTANT: Backup your database before running these commands!**

#### 1.1 Add UOM Column to m_attribute Table

```sql
-- Add the UOM foreign key column to m_attribute table
ALTER TABLE m_attribute
ADD COLUMN c_uom_id INTEGER REFERENCES c_uom(id);

-- Add index for performance
CREATE INDEX idx_m_attribute_c_uom_id ON m_attribute(c_uom_id);
```

#### 1.2 Add Common UOM Entries

```sql
-- Add some common UOM entries if they don't exist
INSERT INTO c_uom (name, description, uomsymbol, stdprecision, is_active, is_default)
VALUES
  ('Inch', 'Inches for measurements', 'in', 2, true, false),
  ('Centimeter', 'Centimeters for measurements', 'cm', 2, true, false),
  ('Millimeter', 'Millimeters for measurements', 'mm', 2, true, false),
  ('Kilogram', 'Kilograms for weight', 'kg', 3, true, false),
  ('Gram', 'Grams for weight', 'g', 0, true, false),
  ('Liter', 'Liters for volume', 'L', 2, true, false),
  ('Milliliter', 'Milliliters for volume', 'mL', 0, true, false),
  ('Piece', 'Individual pieces/units', 'pcs', 0, true, false),
  ('Meter', 'Meters for length', 'm', 2, true, false),
  ('Foot', 'Feet for measurements', 'ft', 2, true, false),
  ('Pound', 'Pounds for weight', 'lb', 2, true, false),
  ('Ounce', 'Ounces for weight', 'oz', 2, true, false),
  ('Gallon', 'Gallons for volume', 'gal', 2, true, false),
  ('Yard', 'Yards for length', 'yd', 2, true, false)
ON CONFLICT (name) DO NOTHING;
```

#### 1.3 Verification Queries

After running the migration, verify the changes:

```sql
-- Check if the column was added successfully
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'm_attribute' AND column_name = 'c_uom_id';

-- Check if the foreign key constraint exists
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'm_attribute' AND constraint_type = 'FOREIGN KEY';

-- Check if the index was created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'm_attribute' AND indexname = 'idx_m_attribute_c_uom_id';

-- Verify UOM entries were added
SELECT id, name, uomsymbol, description
FROM c_uom
WHERE is_active = true
ORDER BY name;
```

#### 1.4 Test the Schema Changes

```sql
-- Test that we can update an existing attribute with a UOM
UPDATE m_attribute
SET c_uom_id = (SELECT id FROM c_uom WHERE name = 'Inch' LIMIT 1)
WHERE name = 'Screen Size' OR name LIKE '%diagonal%' OR name LIKE '%size%'
LIMIT 1;

-- Verify the update worked
SELECT a.name, a.attribute_type, u.name as uom_name, u.uomsymbol
FROM m_attribute a
LEFT JOIN c_uom u ON a.c_uom_id = u.id
WHERE a.c_uom_id IS NOT NULL;

-- Rollback the test update if needed
UPDATE m_attribute SET c_uom_id = NULL WHERE c_uom_id IS NOT NULL;
```

### Step 2: Post-Migration Tasks

#### 2.1 Regenerate Database Types
After the database changes, you'll need to regenerate your Supabase types:

```bash
# If using Supabase CLI
supabase gen types typescript --local > src/lib/types/supabase.types.ts

# Or if using a custom script, run your type generation command
```

#### 2.2 Regenerate Zod Schemas
Run your Zod schema generation tool to include the new `c_uom_id` field:

```bash
# Run your schema generation command (adjust as needed)
npm run generate:schemas
# or
pnpm generate:schemas
```

### Step 3: Expected Schema Changes

After regeneration, you should see these additions in your schemas:

**In `supabase.zod.schemas.ts`:**
```typescript
export const mAttributeRowSchema = z.object({
  // ... existing fields
  c_uom_id: z.number().nullable(), // New field
});

export const mAttributeInsertSchema = z.object({
  // ... existing fields
  c_uom_id: z.number().optional().nullable(), // New field
});

export const mAttributeUpdateSchema = z.object({
  // ... existing fields
  c_uom_id: z.number().optional().nullable(), // New field
});
```

**In `supabase.types.ts`:**
```typescript
m_attribute: {
  Row: {
    // ... existing fields
    c_uom_id: number | null // New field
  }
  Insert: {
    // ... existing fields
    c_uom_id?: number | null // New field
  }
  Update: {
    // ... existing fields
    c_uom_id?: number | null // New field
  }
}
```

### Step 4: Database Migration Checklist

- [ ] **Backup database** before making changes
- [ ] **Run ALTER TABLE** to add `c_uom_id` column
- [ ] **Create index** for performance
- [ ] **Insert common UOM entries**
- [ ] **Run verification queries** to confirm changes
- [ ] **Test schema changes** with sample updates
- [ ] **Regenerate TypeScript types** from Supabase
- [ ] **Regenerate Zod schemas**
- [ ] **Verify new fields** appear in generated files
- [ ] **Commit database changes** to version control

### Step 5: Rollback Plan (if needed)

If you need to rollback the database changes:

```sql
-- Remove the column (this will also drop the foreign key constraint)
ALTER TABLE m_attribute DROP COLUMN c_uom_id;

-- Remove the index (if it wasn't automatically dropped)
DROP INDEX IF EXISTS idx_m_attribute_c_uom_id;

-- Optionally remove the UOM entries we added (be careful!)
DELETE FROM c_uom WHERE name IN (
  'Inch', 'Centimeter', 'Millimeter', 'Kilogram', 'Gram',
  'Liter', 'Milliliter', 'Piece', 'Meter', 'Foot',
  'Pound', 'Ounce', 'Gallon', 'Yard'
);
```

---

## Phase 2: Code Implementation (Next Steps)

Once the database changes are complete and types are regenerated, we'll proceed with:

1. **Create UOM Service** - Service layer for UOM operations
2. **Update Form Schema** - Add UOM field to form validation
3. **Update Server Logic** - Load UOM lookup data
4. **Update Frontend Form** - Add UOM select field
5. **Testing** - Verify all functionality works

---

## Code Implementation

### Step 2: Create UOM Service

Create `src/lib/services/supabase/uom.service.ts`:

```typescript
import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type UOM = Tables<'c_uom'>;
export type UOMLookup = { value: number; label: string; symbol?: string };

export class UOMService {
  constructor(public supabase: SupabaseClient<Database>) {}

  async getLookup(): Promise<UOMLookup[]> {
    const { data, error } = await this.supabase
      .from('c_uom')
      .select('value:id, label:name, symbol:uomsymbol')
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(`Failed to load UOM lookup: ${error.message}`);
    return data || [];
  }

  async getById(id: number): Promise<UOM | null> {
    const { data, error } = await this.supabase
      .from('c_uom')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch UOM: ${error.message}`);
    return data;
  }
}
```

### Step 3: Update Service Exports

Update `src/lib/services/supabase/index.ts`:

```typescript
// Add this line
export { UOMService } from './uom.service';
```

### Step 4: Update Form Schema

Update `src/routes/(app)/catalog/product-attributes/attributes/edit/[[id]]/schema.ts`:

```typescript
import { mAttributeInsertSchema } from '$lib/types/supabase.zod.schemas';
import { z } from 'zod';

export const mAttributeFormSchema = mAttributeInsertSchema.extend({
  attribute_group_id: z.coerce.number().positive({ message: 'Attribute group is required.' }),
  c_uom_id: z.coerce.number().optional().nullable() // Add UOM field with coercion
});
```

### Step 5: Update Server Load Function

Update `src/routes/(app)/catalog/product-attributes/attributes/edit/[[id]]/+page.server.ts`:

```typescript
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { mAttributeOptionInsertSchema } from '$lib/types/supabase.zod.schemas';
import { mAttributeFormSchema } from './schema';
import { AttributeService } from '$lib/services/supabase/attribute.service';
import { AttributeOptionService } from '$lib/services/supabase/attribute-option.service';
import { AttributeGroupService } from '$lib/services/supabase/attribute-group.service';
import { UOMService } from '$lib/services/supabase/uom.service'; // Add UOM service
import { createSimpleCRUD } from '$lib/utils/simple-crud.factory';
import { attributePayloadBuilder } from './attribute.payload';
import { attributeOptionPayloadBuilder } from './attribute-option.payload';

export const load = async ({ depends, params, locals: { supabase } }) => {
  depends('catalog:attributes');

  const id = params.id ? parseInt(params.id) : null;
  if (params.id && isNaN(id as number)) {
    throw error(400, 'Invalid attribute ID');
  }

  const attributeService = new AttributeService(supabase);
  const attributeOptionService = new AttributeOptionService(supabase);
  const attributeGroupService = new AttributeGroupService(supabase);
  const uomService = new UOMService(supabase); // Add UOM service

  const [entity, attributeOptions, attributeGroups, uoms] = await Promise.all([
    id ? attributeService.getById(id) : Promise.resolve(null),
    id ? attributeOptionService.getByAttributeId(id) : Promise.resolve([]),
    attributeGroupService.getLookup(),
    uomService.getLookup() // Fetch UOM lookup data
  ]);

  if (id && !entity) {
    throw error(404, 'Attribute not found');
  }

  const form = await superValidate(entity, zod(mAttributeFormSchema));
  const formAttributeOptions = await superValidate(zod(mAttributeOptionInsertSchema));

  return {
    form,
    formAttributeOptions,
    entity,
    attributeOptions,
    attributeGroups,
    uoms // Add UOMs to return data
  };
};

// Rest of the file remains the same
const crudAttribute = createSimpleCRUD(
  'Attribute',
  (supabase) => new AttributeService(supabase),
  attributePayloadBuilder,
  mAttributeFormSchema,
  '/catalog/product-attributes/attributes'
);

const crudAttributeOption = createSimpleCRUD(
  'Attribute Option',
  (supabase) => new AttributeOptionService(supabase),
  attributeOptionPayloadBuilder,
  mAttributeOptionInsertSchema
);

export const actions = {
  upsert: crudAttribute.upsert,
  delete: crudAttribute.delete,
  optionUpsert: crudAttributeOption.upsert,
  optionDelete: crudAttributeOption.delete
};
```

### Step 6: Update Frontend Form

Update `src/routes/(app)/catalog/product-attributes/attributes/edit/[[id]]/+page.svelte`:

```svelte
<script lang="ts">
  import SmartForm from '$lib/components/forms/SmartForm.svelte';
  import { createFormConfig } from '$lib/utils/form-config.builder';
  import { splitLayoutConfig, createTabConfigs } from './related-configs';
  import { mAttributeFormSchema } from './schema';
  import SmartSplitLayout from '$lib/components/forms/SmartSplitLayout.svelte';
  import SmartRelatedTabs from '$lib/components/forms/SmartRelatedTabs.svelte';

  let { data } = $props();

  const formConfig = createFormConfig()
    .title('Attribute')
    .field('name', {
      label: 'Name',
      span: 12,
      placeholder: 'e.g., Color, Size, Screen Diagonal'
    })
    .field('code', {
      label: 'Code',
      span: 12,
      placeholder: 'e.g., COLOR, SIZE, SCREEN_DIAGONAL'
    })
    .field('attribute_group_id', {
      label: 'Group',
      type: 'select',
      span: 6,
      options: data.attributeGroups
    })
    .field('attribute_type', {
      label: 'Type',
      type: 'select',
      span: 6,
      options: [
        { value: 'text', label: 'Text' },
        { value: 'number', label: 'Number' },
        { value: 'boolean', label: 'Boolean' },
        { value: 'date', label: 'Date' },
        { value: 'single_select', label: 'Single Select' },
        { value: 'multi_select', label: 'Multi Select' }
      ]
    })
    .field('c_uom_id', {
      label: 'Unit of Measure',
      type: 'select',
      span: 6,
      options: data.uoms,
      placeholder: 'Select unit (optional)',
      description: 'Specify the unit for numeric values or select/multi-select options (e.g., inches, cm, kg)'
    })
    .field('description', {
      label: 'Description',
      type: 'textarea',
      span: 12,
      placeholder: 'Enter a description for the attribute'
    })
    .field('is_active', {
      label: 'Active',
      type: 'boolean',
      span: 12
    })
    .build();

  let attributeType = $derived(data.form.data.attribute_type);
  let showUomField = $derived(
    attributeType === 'number' || 
    attributeType === 'single_select' || 
    attributeType === 'multi_select'
  );

  const tabConfigs = $derived.by(() => {
    return createTabConfigs({
      attributeOptions: data.attributeOptions,
      formAttributeOptions: data.formAttributeOptions,
      entity: data.entity || undefined
    });
  });
</script>

<div class="container mx-auto h-full py-6">
  <SmartSplitLayout config={splitLayoutConfig}>
    {#snippet leftPanel()}
      <SmartForm
        entityName="Attribute"
        form={data.form}
        schema={mAttributeFormSchema}
        config={formConfig}
        action="?/upsert"
        deleteAction="?/delete"
      />
      
      <!-- Show UOM guidance based on attribute type -->
      {#if showUomField}
        <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-800">
            <strong>Unit of Measure:</strong>
            {#if attributeType === 'number'}
              For numeric attributes, specify the unit (e.g., "inches" for TV diagonal, "kg" for weight).
            {:else if attributeType === 'single_select' || attributeType === 'multi_select'}
              For select attributes, specify the unit that applies to the options (e.g., "cm" for size options like Small/Medium/Large).
            {/if}
          </p>
        </div>
      {/if}
    {/snippet}
    
    {#snippet rightPanel()}
      {#if data.entity?.id && (attributeType === 'single_select' || attributeType === 'multi_select')}
        <SmartRelatedTabs tabs={tabConfigs} />
      {:else if data.entity?.id}
        <div class="flex h-full items-center justify-center text-muted-foreground">
          Select 'Single Select' or 'Multi Select' type to add options.
        </div>
      {:else}
        <div
          class="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted text-muted-foreground"
        >
          <div class="text-center">
            <p class="text-lg font-medium">Save Attribute First</p>
            <p class="mt-1 text-sm">Complete the form on the left to manage related data</p>
          </div>
        </div>
      {/if}
    {/snippet}
  </SmartSplitLayout>
</div>
```

## Usage Examples

After implementation, users can create:

### Numeric Attributes with UOM:
- **Screen Diagonal**: Type=Number, UOM=Inch
- **Weight**: Type=Number, UOM=Kilogram  
- **Height**: Type=Number, UOM=Centimeter

### Select Attributes with UOM:
- **T-Shirt Size**: Type=Single Select, UOM=Centimeter (options: S, M, L, XL)
- **Package Weight Category**: Type=Single Select, UOM=Kilogram (options: Light, Medium, Heavy)
- **Available Volumes**: Type=Multi Select, UOM=Liter (options: 0.5L, 1L, 2L)

## Migration Steps

1. **Database**: Run the ALTER TABLE and INSERT statements
2. **Regenerate schemas**: Run your Zod schema generation tool
3. **Code updates**: Implement the service and update existing files
4. **Test**: Verify all attribute types work with optional UOM

## Benefits

- **Semantic clarity**: "55 inches" instead of just "55"
- **Consistent units**: All size options use the same unit
- **Future-proof**: Foundation for unit conversions
- **Flexible**: Works for numeric values and categorical options
- **Backward compatible**: Existing attributes continue to work

The UOM field will be optional but available for numeric, single_select, and multi_select attribute types as requested.