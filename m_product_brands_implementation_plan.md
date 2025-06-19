# M_Product_Brands Implementation Plan

## 🎯 Overview
Add `m_product_brands` table to link products to brands and integrate brand filtering into the pricing-rules system, following the same pattern as categories.

## 📋 Implementation Steps

### 1. Database Schema Changes

#### Create `m_product_brands` Table
```sql
-- Create the brands table
CREATE TABLE m_product_brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on name
ALTER TABLE m_product_brands ADD CONSTRAINT m_product_brands_name_unique UNIQUE (name);

-- Create indexes for performance
CREATE INDEX idx_m_product_brands_active ON m_product_brands (is_active);
CREATE INDEX idx_m_product_brands_name ON m_product_brands (name);

-- Add RLS policies if needed
ALTER TABLE m_product_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON m_product_brands FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON m_product_brands FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON m_product_brands FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON m_product_brands FOR DELETE USING (auth.role() = 'authenticated');
```

#### Add Brand Reference to `m_product`
```sql
-- Add brand_id column to m_product table
ALTER TABLE m_product 
ADD COLUMN m_product_brand_id INTEGER REFERENCES m_product_brands(id);

-- Create index for performance
CREATE INDEX idx_m_product_brand_id ON m_product (m_product_brand_id);
```

#### Update Database Function
```sql
-- Update the pricing rules function to include brand matching
CREATE OR REPLACE FUNCTION find_applicable_pricing_rules(
  p_product_id INTEGER,
  p_partner_id INTEGER DEFAULT NULL,
  p_quantity INTEGER DEFAULT 1,
  p_order_value DECIMAL DEFAULT NULL,
  p_target_group TEXT DEFAULT NULL
)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  conditions JSONB,
  formula JSONB,
  priority INTEGER,
  target_group TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_category_id INTEGER;
  v_brand_id INTEGER;
  v_product_attributes JSONB;
  v_product_exists BOOLEAN;
BEGIN
  -- Check if product exists and get its data
  SELECT 
    p.m_product_category_id,
    p.m_product_brand_id,
    get_product_attributes(p.id),
    true
  INTO v_category_id, v_brand_id, v_product_attributes, v_product_exists
  FROM m_product p 
  WHERE p.id = p_product_id;
  
  -- Only return empty if product doesn't exist at all
  IF v_product_exists IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    pr.id,
    pr.name,
    pr.conditions,
    pr.formula,
    pr.priority,
    pr.target_group
  FROM pricing_rules pr
  WHERE pr.is_active = true
    AND (pr.starts_at IS NULL OR pr.starts_at <= NOW())
    AND (pr.ends_at IS NULL OR pr.ends_at >= NOW())
    AND (pr.target_group IS NULL OR pr.target_group = p_target_group OR p_target_group IS NULL)
    
    -- Partner matching
    AND (
      pr.conditions->'partner_ids' IS NULL 
      OR p_partner_id IS NULL
      OR pr.conditions->'partner_ids' @> to_jsonb(p_partner_id)
    )
    
    -- Product matching  
    AND (
      pr.conditions->'product_ids' IS NULL
      OR pr.conditions->'product_ids' @> to_jsonb(p_product_id)
    )
    
    -- Category matching - handle NULL category
    AND (
      pr.conditions->'category_ids' IS NULL
      OR v_category_id IS NULL
      OR pr.conditions->'category_ids' @> to_jsonb(v_category_id)
    )
    
    -- Brand matching - handle NULL brand (NEW)
    AND (
      pr.conditions->'brand_ids' IS NULL
      OR v_brand_id IS NULL
      OR pr.conditions->'brand_ids' @> to_jsonb(v_brand_id)
    )
    
    -- Quantity matching
    AND (
      pr.conditions->'min_quantity' IS NULL
      OR (pr.conditions->>'min_quantity')::INTEGER <= p_quantity
    )
    AND (
      pr.conditions->'max_quantity' IS NULL  
      OR (pr.conditions->>'max_quantity')::INTEGER >= p_quantity
    )
    
    -- Order value matching
    AND (
      pr.conditions->'min_order_value' IS NULL
      OR p_order_value IS NULL
      OR (pr.conditions->>'min_order_value')::DECIMAL <= p_order_value
    )
    
    -- Attribute matching
    AND (
      pr.conditions->'attributes' IS NULL
      OR check_attributes_match(pr.conditions->'attributes', v_product_attributes)
    )
    
  ORDER BY pr.priority ASC, pr.id ASC;
END;
$$;
```

### 2. Backend Services Implementation

#### Create Brand Service
**File:** `src/lib/services/supabase/brand.service.ts`

```typescript
import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type Brand = Tables<'m_product_brands'>;
export type BrandCreate = Omit<Brand, 'id' | 'created_at' | 'updated_at'>;
export type BrandUpdate = Partial<BrandCreate>;
export type BrandLookup = { value: number; label: string };

export class BrandService implements CRUDService<Brand, BrandCreate, BrandUpdate> {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getById(id: number): Promise<Brand | null> {
    const { data, error } = await this.supabase
      .from('m_product_brands')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch brand: ${error.message}`);
    return data;
  }

  async create(data: BrandCreate): Promise<Brand> {
    const { data: newBrand, error } = await this.supabase
      .from('m_product_brands')
      .insert(data)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create brand: ${error.message}`);
    if (!newBrand) throw new Error('Failed to create brand: No data returned');
    return newBrand;
  }

  async update(id: number, data: BrandUpdate): Promise<Brand> {
    const { data: updatedBrand, error } = await this.supabase
      .from('m_product_brands')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update brand: ${error.message}`);
    if (!updatedBrand) throw new Error('Failed to update brand: No data returned');
    return updatedBrand;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase.from('m_product_brands').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete brand: ${error.message}`);
  }

  async list(filters?: Record<string, unknown>): Promise<Brand[]> {
    let query = this.supabase.from('m_product_brands').select('*');

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active as boolean);
    }

    const { data, error } = await query.order('name');
    if (error) throw new Error(`Failed to list brands: ${error.message}`);
    return data || [];
  }

  async getLookup(): Promise<BrandLookup[]> {
    const { data, error } = await this.supabase
      .from('m_product_brands')
      .select('value:id, label:name')
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(`Failed to load brand lookup: ${error.message}`);
    return data || [];
  }
}
```

#### Update Service Index
**File:** `src/lib/services/supabase/index.ts`

```typescript
// Add this export
export { BrandService } from './brand.service';
// ... existing exports
```

#### Update Pricing Rules Types
**File:** `src/lib/types/pricing-rules.types.ts`

```typescript
export interface PricingConditions {
  partner_ids?: number[];
  product_ids?: number[];
  category_ids?: number[];
  brand_ids?: number[]; // 🆕 Add brand support
  attributes?: AttributeCondition[];
  min_quantity?: number;
  max_quantity?: number;
  min_order_value?: number;
}
```

### 3. Frontend Implementation

#### Update Pricing Rules Server Logic
**File:** `src/routes/(app)/crm/pricing-rules/[id]/+page.server.ts`

```typescript
import {
  PricingRulesService,
  PartnerService,
  CategoryService,
  AttributeService,
  BrandService // 🆕 Add BrandService
} from '$lib/services/supabase';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
  // ... existing logic ...

  const [partners, categories, attributes, brands] = await Promise.all([
    new PartnerService(supabase).getLookup(),
    new CategoryService(supabase).getLookup(),
    new AttributeService(supabase).getLookup(),
    new BrandService(supabase).getLookup() // 🆕 Add brands lookup
  ]);

  return {
    rule,
    isCreateMode,
    formPricingRule: await superValidate(formData, zod(pricingRulesInsertSchema)),
    lookupData: {
      partners,
      categories,
      attributes,
      brands // 🆕 Add brands to lookup data
    }
  };
};
```

#### Create Brands Selector Component
**File:** `src/lib/components/pricing-rules/condition-types/BrandsSelector.svelte`

```svelte
<script lang="ts">
  import { SmartSelect } from '$lib/components/forms/fields/SmartSelect.svelte';
  
  interface Props {
    selectedBrandIds: number[];
    brandsLookup: { value: number; label: string }[];
    onBrandsChange: (brandIds: number[]) => void;
  }
  
  let { selectedBrandIds, brandsLookup, onBrandsChange }: Props = $props();
  
  const fieldConfig = {
    name: 'brand_ids',
    label: 'Brendovi',
    type: 'number' as const,
    placeholder: 'Izaberite brendove...',
    options: brandsLookup
  };
</script>

<SmartSelect
  field={fieldConfig}
  bind:value={selectedBrandIds}
  onchange={() => onBrandsChange(selectedBrandIds)}
/>
<p class="text-xs text-muted-foreground mt-2">
  Pravilo će se primeniti samo na proizvode izabranih brendova.
</p>
```

#### Update Conditions Builder Component
**File:** `src/lib/components/pricing-rules/builders/ConditionsBuilder.svelte`

Add brands section after categories:

```svelte
<script lang="ts">
  import BrandsSelector from '../condition-types/BrandsSelector.svelte';
  
  interface Props {
    conditions: PricingConditions;
    lookupData: {
      partners: { value: number; label: string }[];
      categories: { value: number; label: string }[];
      attributes: { value: number; label: string }[];
      brands: { value: number; label: string }[]; // 🆕 Add brands
    };
    onConditionsChange: (conditions: PricingConditions) => void;
  }
</script>

<!-- Add this section after Categories Section -->
<!-- Brands Section -->
<Card.Root>
  <Card.Header>
    <Card.Title>Brendovi proizvoda</Card.Title>
  </Card.Header>
  <Card.Content>
    <BrandsSelector
      selectedBrandIds={conditions.brand_ids || []}
      brandsLookup={lookupData.brands}
      onBrandsChange={(brandIds) => updateConditions({ brand_ids: brandIds })}
    />
  </Card.Content>
</Card.Root>
```

#### Update Pricing Rules List Page
**File:** `src/routes/(app)/crm/pricing-rules/+page.server.ts`

```typescript
export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  try {
    const service = new PricingRulesService(supabase);
    const rulesFromDb = await service.list();

    const rules = rulesFromDb.map((rule) => {
      const conditions = rule.conditions || {};
      const partnerCount = conditions.partner_ids?.length || 0;
      const categoryCount = conditions.category_ids?.length || 0;
      const brandCount = conditions.brand_ids?.length || 0; // 🆕 Add brand count
      const attributeCount = conditions.attributes?.length || 0;
      return {
        ...rule,
        partnerCount,
        categoryCount,
        brandCount, // 🆕 Add brand count
        attributeCount
      };
    });

    return { rules };
  } catch (error) {
    console.error('Error loading pricing rules:', error);
    return { rules: [] };
  }
};
```

#### Update Table Columns
**File:** `src/routes/(app)/crm/pricing-rules/columns.ts`

```typescript
export const pricingRulesColumns = [
  {
    key: 'name',
    label: 'Ime pravila',
    sortable: true,
    className: 'font-medium'
  },
  {
    key: 'partnerCount',
    label: 'Partneri',
    type: 'number',
    className: 'text-center w-20'
  },
  {
    key: 'categoryCount',
    label: 'Kategorije',
    type: 'number',
    className: 'text-center w-20'
  },
  {
    key: 'brandCount', // 🆕 Add brand column
    label: 'Brendovi',
    type: 'number',
    className: 'text-center w-20'
  },
  {
    key: 'attributeCount',
    label: 'Atributi',
    type: 'number',
    className: 'text-center w-20'
  },
  // ... rest of columns
];
```

#### Update Pricing Rules List Template
**File:** `src/routes/(app)/crm/pricing-rules/+page.svelte`

Add brand count badge in the table after categories:

```svelte
<Table.Cell class="text-center">
  <Badge variant={rule.brandCount > 0 ? 'default' : 'secondary'}>
    {rule.brandCount}
  </Badge>
</Table.Cell>
```

### 4. Testing & Validation

#### Test Database Function
```sql
-- Test the updated function
SELECT * FROM find_applicable_pricing_rules(
  p_product_id := 1,
  p_partner_id := NULL,
  p_quantity := 1,
  p_order_value := NULL,
  p_target_group := NULL
);
```

#### Test Brand Service
Create a simple test to verify the BrandService works:
- Create a brand
- Fetch brand lookup data
- Update and delete brand

#### Test Frontend Integration
- Create a pricing rule with brand conditions
- Verify brand selector shows available brands
- Verify brand count displays correctly in the list

### 5. Sample Data (Optional)

```sql
-- Insert some sample brands
INSERT INTO m_product_brands (name, description, is_active) VALUES
('Samsung', 'South Korean multinational electronics company', true),
('Apple', 'American multinational technology company', true),
('LG', 'South Korean multinational electronics company', true),
('Sony', 'Japanese multinational conglomerate', true),
('Xiaomi', 'Chinese electronics company', true);

-- Update some products to have brands (example)
UPDATE m_product SET m_product_brand_id = 1 WHERE name ILIKE '%samsung%';
UPDATE m_product SET m_product_brand_id = 2 WHERE name ILIKE '%apple%';
UPDATE m_product SET m_product_brand_id = 3 WHERE name ILIKE '%lg%';
```

## 📋 Implementation Checklist

### Database
- [ ] Create `m_product_brands` table
- [ ] Add `m_product_brand_id` to `m_product` table
- [ ] Update `find_applicable_pricing_rules` function
- [ ] Add indexes and constraints
- [ ] Test database function

### Backend
- [ ] Create `BrandService` class
- [ ] Update service index exports
- [ ] Update `PricingConditions` interface
- [ ] Test brand service methods

### Frontend
- [ ] Create `BrandsSelector` component
- [ ] Update `ConditionsBuilder` component
- [ ] Update pricing rules server logic
- [ ] Update pricing rules list page
- [ ] Update table columns and display
- [ ] Test brand filtering in UI

### Validation
- [ ] Test end-to-end brand filtering
- [ ] Verify pricing rules work with brand conditions
- [ ] Test edge cases (NULL brands, empty conditions)

## 🎯 Expected Result

After implementation, users will be able to:
1. Create pricing rules that target specific brands
2. See brand counts in the pricing rules list
3. Filter products by brand in pricing calculations
4. Combine brand conditions with other conditions (categories, partners, etc.)

Example pricing rule:
```json
{
  "name": "Samsung Premium Markup",
  "conditions": {
    "brand_ids": [1], // Samsung
    "category_ids": [2, 3], // TVs and Phones
    "min_quantity": 1
  },
  "formula": {
    "type": "proportional_markup",
    "lower_bound": 500,
    "lower_markup": 40,
    "upper_bound": 2000,
    "upper_markup": 15
  }
}
```

This follows the exact same pattern as categories, ensuring consistency with your existing codebase.