# Proportional Markup Pricing Rules Implementation Plan

## Problem Statement
You need to define markup rules with proportional calculation between bounds:
- Lower bound: $100 with 50% markup
- Upper bound: $200 with 20% markup
- Cost of $150 should get proportional markup: 35% (halfway between 50% and 20%)

**Simplified Logic:**
- Cost ≤ $100: 50% markup (lower markup)
- Cost $100-$200: Proportional between 50% and 20%
- Cost ≥ $200: 20% markup (upper markup)

## Solution: Proportional Interpolation Markup System

### Enhanced Conditions Structure

```typescript
interface PricingConditions {
  // Partners (c_bpartner)
  partner_ids?: number[];
  
  // Products
  product_ids?: number[];
  
  // Product Categories
  category_ids?: number[];
  
  // Product Attributes (single_select, multi_select, number only)
  attributes?: AttributeCondition[];
  
  // Additional conditions
  min_quantity?: number;
  max_quantity?: number;
  min_order_value?: number;
}

interface AttributeCondition {
  attribute_id: number;
  type: 'options' | 'number';
  
  // For options type: option IDs (works for both single and multi select)
  option_ids?: number[];
  
  // For number: range conditions
  min_value?: number;
  max_value?: number;
  exact_value?: number;
}
```

### Enhanced Formula Structure

```typescript
interface PricingFormula {
  type: 'markup_cost' | 'fixed_price' | 'discount' | 'percentage_markup' | 'proportional_markup' | 'custom_script';
  
  // Standard formulas
  value?: number;
  discount_percent?: number;
  
  // NEW: Proportional markup with interpolation
  lower_bound: number;      // Lower cost boundary
  lower_markup: number;     // Markup percentage at/below lower bound
  upper_bound: number;      // Upper cost boundary  
  upper_markup: number;     // Markup percentage at/above upper bound
  
  // Custom script for complex logic
  script?: string;
  variables?: Record<string, number>;
  
  // Price constraints
  min_price?: number;
  max_price?: number;
}
```

### Example Configurations with Array-Based Attributes

#### Configuration 1: Samsung TVs with Diagonal Size
```json
{
  "name": "Samsung TV Proportional Pricing",
  "conditions": {
    "category_ids": [1],
    "attributes": [
      {
        "attribute_id": 5,
        "type": "options",
        "option_ids": [25]
      },
      {
        "attribute_id": 7,
        "type": "options",
        "option_ids": [50, 55, 65]
      }
    ]
  },
  "formula": {
    "type": "proportional_markup",
    "lower_bound": 300,
    "lower_markup": 80,
    "upper_bound": 1500,
    "upper_markup": 25
  }
}
```

#### Configuration 2: Electronics with Brand and Size Range
```json
{
  "name": "Electronics Multi-Attribute Pricing",
  "conditions": {
    "category_ids": [1, 2],
    "attributes": [
      {
        "attribute_id": 3,
        "type": "options",
        "option_ids": [10, 11, 12]
      },
      {
        "attribute_id": 8,
        "type": "number",
        "min_value": 40,
        "max_value": 75
      }
    ],
    "min_quantity": 1
  },
  "formula": {
    "type": "proportional_markup",
    "lower_bound": 200,
    "lower_markup": 60,
    "upper_bound": 800,
    "upper_markup": 30,
    "min_price": 99.99
  }
}
```

### Enhanced Service Implementation

```typescript
export class PricingRulesService {
  private matchesConditions(conditions: PricingConditions, context: PricingContext): boolean {
    // Partner matching
    if (conditions.partner_ids?.length && context.partner_id) {
      if (!conditions.partner_ids.includes(context.partner_id)) return false;
    }

    // Product matching
    if (conditions.product_ids?.length && context.product_id) {
      if (!conditions.product_ids.includes(context.product_id)) return false;
    }

    // Category matching
    if (conditions.category_ids?.length && context.category_id) {
      if (!conditions.category_ids.includes(context.category_id)) return false;
    }

    // Attribute matching - ALL attributes must match
    if (conditions.attributes?.length && context.product_attributes) {
      for (const condition of conditions.attributes) {
        if (!this.matchesAttributeCondition(condition, context.product_attributes)) {
          return false;
        }
      }
    }

    // Quantity matching
    if (conditions.min_quantity && context.quantity < conditions.min_quantity) return false;
    if (conditions.max_quantity && context.quantity > conditions.max_quantity) return false;

    // Order value matching
    if (conditions.min_order_value && context.order_value < conditions.min_order_value) return false;

    return true;
  }

  private matchesAttributeCondition(
    condition: AttributeCondition, 
    productAttributes: Record<string, any>
  ): boolean {
    const productAttr = productAttributes[condition.attribute_id.toString()];
    if (!productAttr) return false;

    switch (condition.type) {
      case 'options':
        if (condition.option_ids?.length) {
          // Handle both single and multi-select scenarios
          const productOptionIds = Array.isArray(productAttr) ?
            productAttr.map(id => Number(id)) : [Number(productAttr)];
          return condition.option_ids.some(id => productOptionIds.includes(id));
        }
        return true;

      case 'number':
        const numValue = Number(productAttr);
        if (condition.exact_value !== undefined) return numValue === condition.exact_value;
        if (condition.min_value !== undefined && numValue < condition.min_value) return false;
        if (condition.max_value !== undefined && numValue > condition.max_value) return false;
        return true;

      default:
        return false;
    }
  }

  private applyFormula(formula: PricingFormula, context: PricingContext): number {
    let price: number;

    switch (formula.type) {
      case 'proportional_markup':
        price = this.applyProportionalMarkup(formula, context.cost_price || 0);
        break;

      case 'markup_cost':
        price = (context.cost_price || 0) * (formula.value || 1);
        break;

      case 'custom_script':
        price = this.evaluateCustomScript(formula, context);
        break;

      // ... other formula types
    }

    // Apply price constraints
    if (formula.min_price && price < formula.min_price) price = formula.min_price;
    if (formula.max_price && price > formula.max_price) price = formula.max_price;

    return price;
  }

  private applyProportionalMarkup(formula: PricingFormula, costPrice: number): number {
    const { lower_bound, lower_markup, upper_bound, upper_markup } = formula;

    // Validate required parameters
    if (lower_bound === undefined || lower_markup === undefined || 
        upper_bound === undefined || upper_markup === undefined) {
      throw new Error('Proportional markup requires lower_bound, lower_markup, upper_bound, and upper_markup');
    }

    let markupPercent: number;

    if (costPrice <= lower_bound) {
      // At or below lower bound - use lower markup
      markupPercent = lower_markup;
    } else if (costPrice >= upper_bound) {
      // At or above upper bound - use upper markup
      markupPercent = upper_markup;
    } else {
      // Between bounds - calculate proportional markup
      const ratio = (costPrice - lower_bound) / (upper_bound - lower_bound);
      markupPercent = lower_markup + (upper_markup - lower_markup) * ratio;
    }

    return costPrice * (1 + markupPercent / 100);
  }
}

export interface PricingContext {
  partner_id?: number;
  product_id?: number;
  category_id?: number;
  product_attributes?: Record<string, any>; // attribute_id -> value/option_id
  quantity: number;
  order_value?: number;
  target_group?: string;
  base_price?: number;
  cost_price?: number;
  retail_price?: number;
}
```

### Database Schema and Examples

```sql
-- Create the pricing_rules table
CREATE TABLE pricing_rules (
  id int primary key generated always as identity,
  name text not null,
  conditions jsonb not null default '{}',
  formula jsonb not null,
  priority int not null default 0,
  is_active boolean not null default true,
  target_group text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Example: Samsung TVs with specific diagonal sizes
INSERT INTO pricing_rules (name, conditions, formula) VALUES 
(
  'Samsung TV 50-65 inch Proportional Pricing',
  '{
    "category_ids": [1],
    "attributes": [
      {
        "attribute_id": 5,
        "type": "options",
        "option_ids": [25]
      },
      {
        "attribute_id": 7,
        "type": "options",
        "option_ids": [50, 55, 65]
      }
    ]
  }',
  '{
    "type": "proportional_markup",
    "lower_bound": 300,
    "lower_markup": 80,
    "upper_bound": 1500,
    "upper_markup": 25,
    "min_price": 399.99
  }'
);

-- Example: Electronics with brand and numeric size range
INSERT INTO pricing_rules (name, conditions, formula) VALUES 
(
  'Premium Electronics Multi-Attribute',
  '{
    "category_ids": [1, 2],
    "attributes": [
      {
        "attribute_id": 3,
        "type": "single_select",
        "option_ids": [10, 11, 12]
      },
      {
        "attribute_id": 8,
        "type": "number",
        "min_value": 40,
        "max_value": 75
      }
    ],
    "min_quantity": 1
  }',
  '{
    "type": "proportional_markup",
    "lower_bound": 200,
    "lower_markup": 60,
    "upper_bound": 800,
    "upper_markup": 30
  }'
);
```

### UI Component for Attribute Array Configuration

```typescript
// AttributeConditionsBuilder.svelte
<script lang="ts">
  import type { AttributeCondition } from '$lib/services/supabase/pricing-rules.service';
  
  export let attributes: AttributeCondition[] = [];
  
  // Available attributes from database
  let availableAttributes: Array<{id: number, name: string, type: string}> = [];
  let availableOptions: Record<number, Array<{id: number, name: string}>> = {};
  
  function addAttribute() {
    attributes = [...attributes, {
      attribute_id: 0,
      type: 'single_select',
      option_ids: []
    }];
  }
  
  function removeAttribute(index: number) {
    attributes = attributes.filter((_, i) => i !== index);
  }
  
  function onAttributeChange(index: number, attributeId: number) {
    const attr = availableAttributes.find(a => a.id === attributeId);
    if (attr) {
      attributes[index].type = attr.type as any;
      attributes[index].option_ids = [];
      // Reset numeric values
      delete attributes[index].min_value;
      delete attributes[index].max_value;
      delete attributes[index].exact_value;
    }
  }
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center">
    <h4 class="font-medium">Product Attributes</h4>
    <button onclick={addAttribute} class="btn btn-primary btn-sm">Add Attribute</button>
  </div>
  
  {#each attributes as attr, index}
    <div class="p-4 border rounded space-y-3">
      <div class="flex justify-between items-start">
        <h5 class="font-medium">Attribute {index + 1}</h5>
        <button 
          onclick={() => removeAttribute(index)} 
          class="btn btn-danger btn-sm"
        >
          Remove
        </button>
      </div>
      
      <!-- Attribute Selection -->
      <div>
        <label class="block text-sm font-medium mb-1">Attribute</label>
        <select 
          bind:value={attr.attribute_id}
          onchange={() => onAttributeChange(index, attr.attribute_id)}
          class="w-full px-3 py-2 border rounded"
        >
          <option value={0}>Select attribute...</option>
          {#each availableAttributes as availableAttr}
            <option value={availableAttr.id}>
              {availableAttr.name} ({availableAttr.type})
            </option>
          {/each}
        </select>
      </div>
      
      <!-- Condition Configuration -->
      {#if attr.type === 'single_select' || attr.type === 'multi_select'}
        <div>
          <label class="block text-sm font-medium mb-1">
            {attr.type === 'single_select' ? 'Select Option' : 'Select Options'}
          </label>
          <div class="space-y-2 max-h-32 overflow-y-auto">
            {#each availableOptions[attr.attribute_id] || [] as option}
              <label class="flex items-center">
                <input 
                  type={attr.type === 'single_select' ? 'radio' : 'checkbox'}
                  name="attr_{index}"
                  value={option.id}
                  bind:group={attr.option_ids}
                  class="mr-2"
                />
                {option.name}
              </label>
            {/each}
          </div>
        </div>
      {:else if attr.type === 'number'}
        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="block text-sm font-medium mb-1">Min Value</label>
            <input 
              type="number" 
              bind:value={attr.min_value}
              step="0.01"
              class="w-full px-3 py-2 border rounded"
              placeholder="No min"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Max Value</label>
            <input 
              type="number" 
              bind:value={attr.max_value}
              step="0.01"
              class="w-full px-3 py-2 border rounded"
              placeholder="No max"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Exact Value</label>
            <input 
              type="number" 
              bind:value={attr.exact_value}
              step="0.01"
              class="w-full px-3 py-2 border rounded"
              placeholder="Any value"
            />
          </div>
        </div>
      {/if}
    </div>
  {/each}
  
  {#if attributes.length === 0}
    <div class="text-center py-8 text-gray-500">
      No attribute conditions defined. Click "Add Attribute" to start.
    </div>
  {/if}
</div>
```

### Real-World Example: Samsung TV Pricing

```json
{
  "name": "Samsung TV Tiered Pricing",
  "conditions": {
    "category_ids": [1],
    "attributes": [
      {
        "attribute_id": 5,
        "type": "single_select",
        "option_ids": [25]
      },
      {
        "attribute_id": 7,
        "type": "single_select",
        "option_ids": [50, 55, 65, 75]
      }
    ]
  },
  "formula": {
    "type": "proportional_markup",
    "lower_bound": 400,
    "lower_markup": 70,
    "upper_bound": 2000,
    "upper_markup": 20,
    "min_price": 599.99
  }
}
```

**This rule applies to:**
- Products in category 1 (TVs)
- AND brand attribute = Samsung (option_id 25)
- AND diagonal attribute = 50", 55", 65", or 75" (option_ids 50, 55, 65, 75)

**Pricing logic:**
- Cost ≤ $400: 70% markup
- Cost $400-$2000: Proportional between 70% and 20%
- Cost ≥ $2000: 20% markup
- Minimum price: $599.99

### Testing Strategy

```typescript
describe('Array-Based Attribute Matching', () => {
  test('should match multiple attribute conditions', () => {
    const conditions: PricingConditions = {
      category_ids: [1],
      attributes: [
        {
          attribute_id: 5,
          type: 'single_select',
          option_ids: [25] // Samsung
        },
        {
          attribute_id: 7,
          type: 'single_select',
          option_ids: [50, 55] // 50" or 55"
        }
      ]
    };
    
    const context: PricingContext = {
      category_id: 1,
      product_attributes: {
        '5': 25, // Samsung
        '7': 55  // 55"
      },
      quantity: 1
    };
    
    const matches = service.matchesConditions(conditions, context);
    expect(matches).toBe(true);
  });
  
  test('should not match if any attribute condition fails', () => {
    const conditions: PricingConditions = {
      attributes: [
        {
          attribute_id: 5,
          type: 'single_select',
          option_ids: [25] // Samsung
        },
        {
          attribute_id: 7,
          type: 'single_select',
          option_ids: [50, 55] // 50" or 55"
        }
      ]
    };
    
    const context: PricingContext = {
      product_attributes: {
        '5': 25, // Samsung
        '7': 65  // 65" (not in allowed options)
      },
      quantity: 1
    };
    
    const matches = service.matchesConditions(conditions, context);
    expect(matches).toBe(false);
  });
});
```

## Benefits of Array-Based Attributes

1. **Multiple Conditions**: Can specify multiple attribute requirements
2. **Flexible Matching**: Each attribute can have different matching logic
3. **Clear Structure**: Easy to understand and maintain
4. **Extensible**: Easy to add new attribute types
5. **Precise Targeting**: Can create very specific product rules

This approach allows you to create precise pricing rules like "Samsung TVs between 50-65 inches" or "Premium brand electronics with specific size ranges" while maintaining the proportional markup system.