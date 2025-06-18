# Pricing Rules System

A flexible, database-driven pricing system with proportional markup capabilities and attribute-based conditions.

## Overview

The new pricing rules system replaces the complex multi-table approach with a single `pricing_rules` table that uses JSONB for flexible conditions and formulas. The system leverages PostgreSQL database functions for efficient rule matching.

## Key Features

- **Single Table Design**: All pricing logic in one `pricing_rules` table
- **Database Functions**: Efficient rule matching using PostgreSQL functions
- **Proportional Markup**: Smooth price transitions between cost boundaries
- **Flexible Conditions**: Support for products, categories, attributes, quantities, and partners
- **Array-based Attributes**: Unified handling of single/multi-select attributes
- **Priority System**: Rules applied by priority order
- **Time-based Rules**: Optional start/end dates for rules
- **Target Groups**: Different pricing for retail, wholesale, etc.

## Database Schema

```sql
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
```

## Conditions Structure

```typescript
interface PricingConditions {
  partner_ids?: number[];           // Specific partners
  product_ids?: number[];           // Specific products
  category_ids?: number[];          // Product categories
  attributes?: AttributeCondition[]; // Product attributes
  min_quantity?: number;            // Minimum order quantity
  max_quantity?: number;            // Maximum order quantity
  min_order_value?: number;         // Minimum order value
}

interface AttributeCondition {
  attribute_id: number;
  type: 'options' | 'number';
  option_ids?: number[];            // For options type
  min_value?: number;               // For number type
  max_value?: number;               // For number type
  exact_value?: number;             // For number type
}
```

## Formula Types

### 1. Proportional Markup
Smooth price transitions between cost boundaries:

```json
{
  "type": "proportional_markup",
  "lower_bound": 100,
  "lower_markup": 50,
  "upper_bound": 200,
  "upper_markup": 20
}
```

**Logic:**
- Cost ≤ $100: 50% markup
- Cost $100-$200: Proportional between 50% and 20%
- Cost ≥ $200: 20% markup

### 2. Other Formula Types

```typescript
// Fixed markup on cost
{ "type": "markup_cost", "value": 1.5 }

// Fixed price
{ "type": "fixed_price", "value": 99.99 }

// Percentage discount from retail
{ "type": "discount", "discount_percent": 15 }

// Percentage markup on base price
{ "type": "percentage_markup", "value": 25 }

// Custom script
{ 
  "type": "custom_script", 
  "script": "cost_price * (1 + markup_percent/100)",
  "variables": { "markup_percent": 30 }
}
```

## Usage Examples

### Basic Usage

```typescript
import { PricingRulesService } from '$lib/services/supabase/pricing-rules.service';

const pricingService = new PricingRulesService(supabase);

// Calculate price for a product
const context = {
  product_id: 123,
  quantity: 1,
  cost_price: 800,
  partner_id: 456
};

const price = await pricingService.calculatePrice(context);
```

### Creating Rules

```typescript
// Samsung TV rule with proportional markup
const rule = {
  name: 'Samsung TV Proportional Pricing',
  conditions: {
    category_ids: [1],
    attributes: [
      {
        attribute_id: 5,    // Brand
        type: 'options',
        option_ids: [25]    // Samsung
      },
      {
        attribute_id: 7,    // Screen size
        type: 'options',
        option_ids: [50, 55, 65, 75]
      }
    ]
  },
  formula: {
    type: 'proportional_markup',
    lower_bound: 400,
    lower_markup: 70,
    upper_bound: 2000,
    upper_markup: 20,
    min_price: 599.99
  },
  priority: 1,
  is_active: true
};

await pricingService.create(rule);
```

### Debugging

```typescript
// Get detailed pricing breakdown
const breakdown = await pricingService.getPricingBreakdown(context);
console.log('Applied rule:', breakdown.appliedRule?.name);
console.log('Final price:', breakdown.finalPrice);
```

## Database Functions

The system uses three main PostgreSQL functions:

1. **`find_applicable_pricing_rules()`** - Finds matching rules for a product
2. **`get_product_attributes()`** - Retrieves product attributes as JSONB
3. **`check_attributes_match()`** - Validates attribute conditions

### Function Usage

```sql
-- Find applicable rules for product 123
SELECT * FROM find_applicable_pricing_rules(
  p_product_id := 123,
  p_quantity := 1,
  p_partner_id := 456
);
```

## Performance Benefits

1. **Efficient Filtering**: Database functions filter rules using indexes
2. **Reduced Network Traffic**: Only matching rules are returned
3. **JSONB Optimization**: PostgreSQL's native JSONB support with GIN indexes
4. **Single Query**: No complex joins needed

## Migration from Old System

The migration script handles converting existing `price_rules`, `price_formulas`, and `price_rule_attribute_options` tables to the new format:

```sql
-- Run the migration
\i supabase/migrations/20250617_create_pricing_rules.sql
```

## Real-World Examples

### Electronics Store
```json
{
  "name": "Electronics Tiered Pricing",
  "conditions": {
    "category_ids": [1, 2, 3],
    "attributes": [
      {
        "attribute_id": 3,
        "type": "options", 
        "option_ids": [10, 11, 12]
      }
    ]
  },
  "formula": {
    "type": "proportional_markup",
    "lower_bound": 50,
    "lower_markup": 150,
    "upper_bound": 500,
    "upper_markup": 40
  }
}
```

### Wholesale Pricing
```json
{
  "name": "Wholesale Discount",
  "conditions": {
    "min_quantity": 10
  },
  "formula": {
    "type": "discount",
    "discount_percent": 20
  },
  "target_group": "wholesale"
}
```

### Seasonal Sale
```json
{
  "name": "Summer Sale",
  "conditions": {
    "category_ids": [1, 2]
  },
  "formula": {
    "type": "discount",
    "discount_percent": 25
  },
  "starts_at": "2024-06-01T00:00:00Z",
  "ends_at": "2024-08-31T23:59:59Z"
}
```

## Testing

Use the example file to test different scenarios:

```typescript
import { testProportionalMarkup } from './pricing-rules.example';

// Test proportional markup calculations
testProportionalMarkup();
```

## Best Practices

1. **Use Priority Wisely**: Lower numbers = higher priority
2. **Test Rules**: Use `testRule()` method before activating
3. **Monitor Performance**: Check `getPricingBreakdown()` for debugging
4. **Validate Formulas**: Ensure required parameters are present
5. **Use Time Ranges**: For temporary promotions and sales
6. **Target Groups**: Separate pricing for different customer types

## Troubleshooting

### Common Issues

1. **No Rules Match**: Check conditions and ensure product has required attributes
2. **Wrong Price**: Verify rule priority and formula parameters
3. **Performance**: Ensure database indexes are created
4. **Type Errors**: Use proper type casting for JSONB fields

### Debug Tools

```typescript
// Test specific rule
const result = await pricingService.testRule(ruleId, context);
console.log('Rule matches:', result.matches);
console.log('Calculated price:', result.price);

// Get all applicable rules
const rules = await pricingService.findApplicableRules(context);
console.log('Matching rules:', rules.length);