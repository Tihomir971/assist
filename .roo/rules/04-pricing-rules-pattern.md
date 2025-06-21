# RooCode: Pricing Rules Pattern

## 1. Overview

The **Pricing Rules Pattern** provides a comprehensive framework for implementing complex pricing logic with dynamic conditions and formulas. This pattern enables business users to create sophisticated pricing strategies through a structured UI while maintaining type safety and performance.

The pattern consists of:
1. **Structured Data Models**: Type-safe interfaces for conditions, formulas, and rules
2. **Zod Validation Schemas**: Runtime validation and form integration
3. **Builder Components**: Modular UI components for constructing conditions and formulas
4. **Service Layer**: CRUD operations and price calculation logic
5. **Form Integration**: Seamless integration with SvelteKit forms and validation

---

## 2. Architecture Components

### Core Data Structure
```typescript
// Main pricing rule entity
interface PricingRule {
  id: number;
  name: string;
  conditions: PricingConditions;
  formula: PricingFormula;
  priority: number;
  is_active: boolean;
  target_group?: string;
  starts_at?: string;
  ends_at?: string;
}

// Flexible condition system
interface PricingConditions {
  partner_ids?: number[];
  product_ids?: number[];
  category_ids?: number[];
  brand_ids?: number[];
  attributes?: AttributeCondition[];
  min_quantity?: number;
  max_quantity?: number;
  min_order_value?: number;
}

// Multi-type formula system
interface PricingFormula {
  type: 'fixed_price' | 'discount' | 'percentage_markup' | 'proportional_markup' | 'custom_script';
  value?: number;
  discount_percent?: number;
  lower_bound?: number;
  lower_markup?: number;
  upper_bound?: number;
  upper_markup?: number;
  script?: string;
  variables?: Record<string, number>;
  min_price?: number;
  max_price?: number;
}
```

### File Structure
```
src/lib/types/
├── pricing-rules.types.ts          # TypeScript interfaces
└── pricing-rules.zod.ts            # Zod validation schemas

src/lib/components/pricing-rules/
├── builders/
│   ├── ConditionsBuilder.svelte    # Main conditions builder
│   └── FormulaBuilder.svelte       # Main formula builder
├── condition-types/
│   ├── AttributesConditionBuilder.svelte
│   ├── CategoriesSelector.svelte
│   ├── BrandsSelector.svelte
│   ├── PartnersSelector.svelte
│   └── QuantityRangeInputs.svelte
└── formula-types/
    ├── ProportionalMarkupForm.svelte
    ├── FixedPriceForm.svelte
    ├── DiscountForm.svelte
    ├── PercentageMarkupForm.svelte
    └── CustomScriptForm.svelte

src/routes/(app)/pricing-rules/
├── +page.server.ts                 # List page with priority management
├── +page.svelte                    # Rules list with actions
└── [id]/
    ├── +page.server.ts             # Edit/create page server logic
    └── +page.svelte                # Edit/create form page
```

---

## 3. Implementation Steps

### Step 1: Define Type System

Create comprehensive TypeScript interfaces and Zod schemas:

```typescript
// src/lib/types/pricing-rules.types.ts
export interface PricingRule {
  id: number;
  name: string;
  conditions: PricingConditions;
  formula: PricingFormula;
  priority: number;
  is_active: boolean;
  target_group?: string;
  starts_at?: string;
  ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AttributeCondition {
  attribute_id: number;
  type: 'options' | 'number';
  option_ids?: number[];      // For select-type attributes
  min_value?: number;         // For numeric attributes
  max_value?: number;
  exact_value?: number;
}

export type PricingRuleCreate = Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>;
export type PricingRuleUpdate = Partial<PricingRuleCreate>;
```

```typescript
// src/lib/types/pricing-rules.zod.ts
import { z } from 'zod';

export const attributeConditionSchema = z.object({
  attribute_id: z.number(),
  type: z.enum(['options', 'number']),
  option_ids: z.array(z.number()).optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  exact_value: z.number().optional()
});

export const pricingConditionsSchema = z.object({
  partner_ids: z.array(z.number()).optional(),
  product_ids: z.array(z.number()).optional(),
  category_ids: z.array(z.number()).optional(),
  brand_ids: z.array(z.number()).optional(),
  attributes: z.array(attributeConditionSchema).optional(),
  min_quantity: z.number().optional(),
  max_quantity: z.number().optional(),
  min_order_value: z.number().optional()
});

export const pricingFormulaSchema = z.object({
  type: z.enum(['fixed_price', 'discount', 'percentage_markup', 'proportional_markup', 'custom_script']),
  value: z.number().optional(),
  discount_percent: z.number().optional(),
  lower_bound: z.number().optional(),
  lower_markup: z.number().optional(),
  upper_bound: z.number().optional(),
  upper_markup: z.number().optional(),
  script: z.string().optional(),
  variables: z.record(z.number()).optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional()
});
```

### Step 2: Implement Service Layer

Create a comprehensive service class with CRUD operations and business logic:

```typescript
// src/lib/services/supabase/pricing-rules.service.ts
export class PricingRulesService implements CRUDService<PricingRule, PricingRuleCreate, PricingRuleUpdate> {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getById(id: number): Promise<PricingRule | null> {
    const { data, error } = await this.supabase
      .from('pricing_rules')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch pricing rule: ${error.message}`);
    return data as PricingRule | null;
  }

  async list(filters?: Record<string, unknown>): Promise<PricingRule[]> {
    let query = this.supabase.from('pricing_rules').select('*');
    
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active as boolean);
    }

    const { data, error } = await query.order('priority', { ascending: true });
    if (error) throw new Error(`Failed to list pricing rules: ${error.message}`);
    return data as PricingRule[];
  }

  async create(data: PricingRuleCreate): Promise<PricingRule> {
    const insertData = {
      name: data.name,
      conditions: data.conditions as unknown as Json,
      formula: data.formula as unknown as Json,
      priority: data.priority,
      is_active: data.is_active,
      target_group: data.target_group,
      starts_at: data.starts_at,
      ends_at: data.ends_at
    };

    const { data: newRule, error } = await this.supabase
      .from('pricing_rules')
      .insert(insertData)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create pricing rule: ${error.message}`);
    return newRule as PricingRule;
  }

  async update(id: number, data: PricingRuleUpdate): Promise<PricingRule> {
    const updateData = {
      ...data,
      conditions: data.conditions as unknown as Json,
      formula: data.formula as unknown as Json
    };

    const { data: updatedRule, error } = await this.supabase
      .from('pricing_rules')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update pricing rule: ${error.message}`);
    return updatedRule as PricingRule;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase.from('pricing_rules').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete pricing rule: ${error.message}`);
  }

  // Business logic methods
  async swapPriorities(rule1Id: number, rule2Id: number): Promise<void> {
    const [rule1, rule2] = await Promise.all([
      this.getById(rule1Id),
      this.getById(rule2Id)
    ]);

    if (!rule1 || !rule2) {
      throw new Error('One or both rules not found');
    }

    await Promise.all([
      this.update(rule1Id, { priority: rule2.priority }),
      this.update(rule2Id, { priority: rule1.priority })
    ]);
  }
}
```

### Step 3: Create Builder Components

Implement modular builder components for conditions and formulas:

```svelte
<!-- src/lib/components/pricing-rules/builders/ConditionsBuilder.svelte -->
<script lang="ts">
  import type { PricingConditions, AttributeCondition } from '$lib/types/pricing-rules.types';
  import type { PartnerLookup, CategoryLookup, AttributeLookup, BrandLookup } from '$lib/services/supabase';
  
  import AttributesConditionBuilder from '../condition-types/AttributesConditionBuilder.svelte';
  import CategoriesSelector from '../condition-types/CategoriesSelector.svelte';
  import BrandsSelector from '../condition-types/BrandsSelector.svelte';
  import PartnersSelector from '../condition-types/PartnersSelector.svelte';
  import QuantityRangeInputs from '../condition-types/QuantityRangeInputs.svelte';

  interface Props {
    conditions: PricingConditions | undefined;
    lookupData: {
      partners: PartnerLookup[];
      categories: CategoryLookup[];
      attributes: AttributeLookup[];
      brands: BrandLookup[];
    };
    onConditionsChange: (conditions: PricingConditions) => void;
    supabase: SupabaseClient<Database>;
  }

  let { conditions = $bindable({}), lookupData, onConditionsChange, supabase }: Props = $props();

  let currentConditions = $derived(conditions || {});

  function updateConditions(updates: Partial<PricingConditions>) {
    onConditionsChange({ ...currentConditions, ...updates });
  }

  function handleAttributesChange(newAttributes: AttributeCondition[]) {
    updateConditions({ attributes: newAttributes });
  }
</script>

<div class="space-y-6">
  <PartnersSelector
    selectedPartnerIds={currentConditions.partner_ids || []}
    partners={lookupData.partners}
    onSelectionChange={(ids) => updateConditions({ partner_ids: ids.length > 0 ? ids : undefined })}
  />

  <CategoriesSelector
    selectedCategoryIds={currentConditions.category_ids || []}
    categories={lookupData.categories}
    onSelectionChange={(ids) => updateConditions({ category_ids: ids.length > 0 ? ids : undefined })}
  />

  <BrandsSelector
    selectedBrandIds={currentConditions.brand_ids || []}
    brands={lookupData.brands}
    onSelectionChange={(ids) => updateConditions({ brand_ids: ids.length > 0 ? ids : undefined })}
  />

  <AttributesConditionBuilder
    attributes={currentConditions.attributes}
    attributesLookup={lookupData.attributes}
    onAttributesChange={handleAttributesChange}
    {supabase}
  />

  <QuantityRangeInputs
    minQuantity={currentConditions.min_quantity}
    maxQuantity={currentConditions.max_quantity}
    minOrderValue={currentConditions.min_order_value}
    onRangeChange={(updates) => updateConditions(updates)}
  />
</div>
```

```svelte
<!-- src/lib/components/pricing-rules/builders/FormulaBuilder.svelte -->
<script lang="ts">
  import type { PricingFormula } from '$lib/types/pricing-rules.types';
  import * as Select from '$lib/components/ui/select';
  import * as Card from '$lib/components/ui/card';
  
  import ProportionalMarkupForm from '../formula-types/ProportionalMarkupForm.svelte';
  import FixedPriceForm from '../formula-types/FixedPriceForm.svelte';
  import DiscountForm from '../formula-types/DiscountForm.svelte';
  import PercentageMarkupForm from '../formula-types/PercentageMarkupForm.svelte';
  import CustomScriptForm from '../formula-types/CustomScriptForm.svelte';

  interface Props {
    formula: PricingFormula;
    onFormulaChange: (formula: PricingFormula) => void;
  }

  let { formula, onFormulaChange }: Props = $props();

  const formulaTypes = [
    { value: 'proportional_markup', label: 'Proportional Markup' },
    { value: 'fixed_price', label: 'Fixed Price' },
    { value: 'discount', label: 'Discount (%)' },
    { value: 'percentage_markup', label: 'Percentage Markup (%)' },
    { value: 'custom_script', label: 'Custom Script' }
  ];

  function handleTypeChange(newType: string | undefined) {
    if (!newType) return;

    let newFormulaBase: Partial<PricingFormula> = { type: newType as PricingFormula['type'] };

    switch (newType) {
      case 'proportional_markup':
        newFormulaBase = {
          ...newFormulaBase,
          lower_bound: formula.lower_bound ?? 0,
          lower_markup: formula.lower_markup ?? 50,
          upper_bound: formula.upper_bound ?? 1000,
          upper_markup: formula.upper_markup ?? 20,
          min_price: formula.min_price,
          max_price: formula.max_price
        };
        break;
      case 'fixed_price':
        newFormulaBase = { ...newFormulaBase, value: formula.value ?? 100 };
        break;
      case 'discount':
        newFormulaBase = { ...newFormulaBase, discount_percent: formula.discount_percent ?? 10 };
        break;
      case 'percentage_markup':
        newFormulaBase = { ...newFormulaBase, value: formula.value ?? 25 };
        break;
      case 'custom_script':
        newFormulaBase = {
          ...newFormulaBase,
          script: formula.script ?? '',
          variables: formula.variables ?? {}
        };
        break;
    }

    onFormulaChange(newFormulaBase as PricingFormula);
  }

  function updateFormula(updates: Partial<PricingFormula>) {
    onFormulaChange({ ...formula, ...updates });
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Pricing Formula</Card.Title>
  </Card.Header>
  <Card.Content class="space-y-4">
    <div class="space-y-2">
      <Label for="formula-type">Formula Type</Label>
      <Select.Root value={formula.type} onSelectedChange={handleTypeChange}>
        <Select.Trigger>
          <Select.Value placeholder="Select formula type" />
        </Select.Trigger>
        <Select.Content>
          {#each formulaTypes as type}
            <Select.Item value={type.value}>{type.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>

    {#if formula.type === 'proportional_markup'}
      <ProportionalMarkupForm {formula} onFormulaChange={updateFormula} />
    {:else if formula.type === 'fixed_price'}
      <FixedPriceForm {formula} onFormulaChange={updateFormula} />
    {:else if formula.type === 'discount'}
      <DiscountForm {formula} onFormulaChange={updateFormula} />
    {:else if formula.type === 'percentage_markup'}
      <PercentageMarkupForm {formula} onFormulaChange={updateFormula} />
    {:else if formula.type === 'custom_script'}
      <CustomScriptForm {formula} onFormulaChange={updateFormula} />
    {/if}
  </Card.Content>
</Card.Root>
```

### Step 4: Implement Server Logic

Create server-side logic for list and edit pages:

```typescript
// src/routes/(app)/pricing-rules/+page.server.ts
export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  try {
    const service = new PricingRulesService(supabase);
    const rulesFromDb = await service.list();

    // Enhance rules with condition counts for display
    const rules = rulesFromDb.map((rule) => {
      const conditions = rule.conditions || {};
      return {
        ...rule,
        partnerCount: conditions.partner_ids?.length || 0,
        categoryCount: conditions.category_ids?.length || 0,
        brandCount: conditions.brand_ids?.length || 0,
        attributeCount: conditions.attributes?.length || 0
      };
    });

    return { rules };
  } catch (error) {
    console.error('Error loading pricing rules:', error);
    return { rules: [] };
  }
};

export const actions: Actions = {
  create: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, zod(createSchema));
    if (!form.valid) return fail(400, { form });

    try {
      const service = new PricingRulesService(supabase);
      const newRule = await service.create({
        name: form.data.name,
        conditions: {},
        formula: { type: 'percentage_markup', value: 20 },
        priority: 0,
        is_active: true
      });

      return { success: true, ruleId: newRule.id };
    } catch (error) {
      console.error('Error creating pricing rule:', error);
      return fail(500, { error: 'Failed to create pricing rule' });
    }
  },

  swapPriorities: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, zod(swapPrioritiesSchema));
    if (!form.valid) return fail(400, { form });

    try {
      const service = new PricingRulesService(supabase);
      await service.swapPriorities(form.data.rule1Id, form.data.rule2Id);
      return { success: true };
    } catch (error) {
      console.error('Error swapping priorities:', error);
      return fail(500, { error: 'Failed to swap priorities' });
    }
  }
};
```

```typescript
// src/routes/(app)/pricing-rules/[id]/+page.server.ts
export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
  const pricingRulesService = new PricingRulesService(supabase);

  let rule: PricingRule | null = null;
  let isCreateMode = true;

  if (params.id && params.id !== 'create') {
    const ruleId = parseInt(params.id);
    if (isNaN(ruleId)) throw error(400, 'Invalid rule ID');

    rule = await pricingRulesService.getById(ruleId);
    if (!rule) throw error(404, 'Pricing rule not found');
    isCreateMode = false;
  }

  // Load lookup data for conditions
  const [partners, categories, attributes, brands] = await Promise.all([
    new PartnerService(supabase).getLookup(),
    new CategoryService(supabase).getLookup(),
    new AttributeService(supabase).getLookup(),
    new BrandService(supabase).getLookup()
  ]);

  const formData = rule ? {
    id: rule.id,
    name: rule.name,
    formula: rule.formula,
    conditions: rule.conditions || {},
    priority: rule.priority,
    is_active: rule.is_active,
    target_group: rule.target_group,
    starts_at: rule.starts_at,
    ends_at: rule.ends_at
  } : {
    name: '',
    formula: { type: 'percentage_markup' as const, value: 20 },
    conditions: {},
    priority: 0,
    is_active: true,
    target_group: null,
    starts_at: null,
    ends_at: null
  };

  return {
    rule,
    isCreateMode,
    formPricingRule: await superValidate(formData, zod(formSchema)),
    lookupData: { partners, categories, attributes, brands }
  };
};
```

### Step 5: Create Frontend Pages

Implement the main form page with builder components:

```svelte
<!-- src/routes/(app)/pricing-rules/[id]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { superForm } from 'sveltekit-superforms';
  import { zod } from 'sveltekit-superforms/adapters';

  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Switch } from '$lib/components/ui/switch';

  import type { PageData } from './$types';
  import type { PricingFormula, PricingConditions } from '$lib/types/pricing-rules.types';
  import FormulaBuilder from '$lib/components/pricing-rules/builders/FormulaBuilder.svelte';
  import ConditionsBuilder from '$lib/components/pricing-rules/builders/ConditionsBuilder.svelte';

  let { data }: { data: PageData } = $props();

  const form = superForm(data.formPricingRule, {
    dataType: 'json',
    onResult: ({ result }) => {
      if (result.type === 'success') {
        toast.success(data.isCreateMode ? 'Rule created successfully' : 'Rule updated successfully');
        if (data.isCreateMode && result.data?.data?.id) {
          goto(`/pricing-rules/${result.data.data.id}`);
        }
      } else if (result.type === 'failure') {
        const errorMessage = result.data?.error || 'Error saving rule';
        toast.error(errorMessage);
      }
    }
  });

  const { form: formData, enhance: formEnhance } = form;

  function handleFormulaChange(newFormula: PricingFormula) {
    $formData.formula = newFormula;
  }

  function handleConditionsChange(newConditions: PricingConditions) {
    $formData.conditions = newConditions;
  }
</script>

<div class="container mx-auto py-6">
  <div class="mb-6">
    <Button variant="ghost" onclick={() => goto('/pricing-rules')}>
      <ArrowLeft class="mr-2 h-4 w-4" />
      Back to Rules
    </Button>
  </div>

  <form method="POST" action="?/upsert" use:formEnhance>
    <div class="grid gap-6">
      <!-- Basic Information -->
      <Card.Root>
        <Card.Header>
          <Card.Title>{data.isCreateMode ? 'Create New' : 'Edit'} Pricing Rule</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Rule Name</Label>
            <Input id="name" bind:value={$formData.name} placeholder="Enter rule name" />
          </div>

          <div class="flex items-center space-x-2">
            <Switch id="is_active" bind:checked={$formData.is_active} />
            <Label for="is_active">Active</Label>
          </div>

          <div class="space-y-2">
            <Label for="priority">Priority</Label>
            <Input id="priority" type="number" bind:value={$formData.priority} />
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Conditions Builder -->
      <ConditionsBuilder
        conditions={$formData.conditions}
        lookupData={data.lookupData}
        onConditionsChange={handleConditionsChange}
        supabase={data.supabase}
      />

      <!-- Formula Builder -->
      <FormulaBuilder
        formula={$formData.formula}
        onFormulaChange={handleFormulaChange}
      />

      <!-- Actions -->
      <div class="flex justify-between">
        <div>
          {#if !data.isCreateMode}
            <Button type="submit" formaction="?/delete" variant="destructive">
              <Trash2 class="mr-2 h-4 w-4" />
              Delete Rule
            </Button>
          {/if}
        </div>
        <div class="space-x-2">
          <Button type="button" variant="outline" onclick={() => goto('/pricing-rules')}>
            Cancel
          </Button>
          <Button type="submit">
            <Save class="mr-2 h-4 w-4" />
            {data.isCreateMode ? 'Create Rule' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  </form>
</div>
```

---

## 4. Key Features

### Modular Condition System
- **Partner-based**: Target specific customers or customer groups
- **Product-based**: Apply to specific products, categories, or brands
- **Attribute-based**: Complex product attribute matching (options and numeric ranges)
- **Quantity-based**: Minimum/maximum quantity and order value conditions

### Flexible Formula Types
- **Fixed Price**: Set absolute price regardless of cost
- **Discount**: Percentage discount from base price
- **Percentage Markup**: Percentage-based markup from cost
- **Proportional Markup**: Dynamic markup based on cost ranges with interpolation
- **Custom Script**: JavaScript-based custom pricing logic

### Priority Management
- **Rule Ordering**: Higher priority rules evaluated first
- **Priority Swapping**: Easy reordering through UI actions
- **Conflict Resolution**: Clear precedence system

### Type Safety
- **Runtime Validation**: Zod schemas ensure data integrity
- **Compile-time Safety**: TypeScript interfaces prevent errors
- **Form Integration**: Seamless validation with SvelteKit forms

---

## 5. Best Practices

### Data Modeling
- **Use JSON columns** for flexible condition and formula storage
- **Maintain referential integrity** through proper foreign key relationships
- **Index priority columns** for efficient rule evaluation
- **Version control** complex rules through audit trails

### Component Architecture
- **Modular builders** for easy extension and maintenance
- **Consistent prop interfaces** across condition and formula components
- **Reactive updates** using Svelte's reactivity system
- **Error boundaries** for graceful failure handling

### Performance Considerations
- **Lazy loading** of lookup data for large datasets
- **Debounced updates** for real-time form validation
- **Efficient queries** with proper indexing on condition fields
- **Caching strategies** for frequently accessed rules

### User Experience
- **Progressive disclosure** of complex options
- **Clear validation messages** with actionable feedback
- **Consistent terminology** across all pricing interfaces
- **Undo/redo capabilities** for complex rule modifications

---

## 6. Extension Points

### Adding New Condition Types
1. Create new condition component in `condition-types/`
2. Add to `ConditionsBuilder.svelte`
3. Update `PricingConditions` interface
4. Extend Zod schema validation

### Adding New Formula Types
1. Create new formula component in `formula-types/`
2. Add to `FormulaBuilder.svelte`
3. Update `PricingFormula` interface
4. Implement calculation logic in service layer

### Integration with External Systems
- **ERP Integration**: Sync rules with external pricing systems
- **Analytics Integration**: Track rule performance and usage
- **Approval Workflows**: Add approval processes for rule changes
- **A/B Testing**: Support for rule experimentation

---

## 7. Database Schema Requirements

```sql
-- Pricing rules table
CREATE TABLE pricing_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}',
  formula JSONB NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  target_group VARCHAR(100),
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_pricing_rules_priority ON pricing_rules(priority);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(is_active);
CREATE INDEX idx_pricing_rules_dates ON pricing_rules(starts_at, ends_at);

-- GIN indexes for JSONB condition queries
CREATE INDEX idx_pricing_rules_conditions ON pricing_rules USING GIN(conditions);
CREATE INDEX idx_pricing_rules_formula ON pricing_rules USING GIN(formula);
```

This pattern provides a comprehensive framework for implementing sophisticated pricing rules while maintaining code quality, type safety, and user experience standards.