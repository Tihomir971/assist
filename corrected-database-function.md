# Corrected Database Function - Handle NULL Categories

## Fixed Function Logic

```sql
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
  v_product_attributes JSONB;
  v_product_exists BOOLEAN;
BEGIN
  -- Check if product exists and get its data
  SELECT 
    p.m_product_category_id,
    get_product_attributes(p.id),
    true
  INTO v_category_id, v_product_attributes, v_product_exists
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
      OR v_category_id IS NULL  -- Product has no category, skip category rules
      OR pr.conditions->'category_ids' @> to_jsonb(v_category_id)
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

## Why This Logic Makes Sense

### Scenario 1: Product with Category
```sql
-- Product: Samsung TV (category_id = 1)
-- Rule: "TVs get 50% markup" (category_ids: [1])
-- Result: ✅ Rule applies
```

### Scenario 2: Product without Category
```sql
-- Product: Custom item (category_id = NULL)
-- Rule: "TVs get 50% markup" (category_ids: [1]) 
-- Result: ❌ Rule doesn't apply (product not in TV category)

-- Product: Custom item (category_id = NULL)
-- Rule: "All Samsung products get 30% markup" (no category condition, brand attribute)
-- Result: ✅ Rule applies if brand matches
```

### Scenario 3: Universal Rules
```sql
-- Product: Any product (category_id = NULL or any value)
-- Rule: "Wholesale customers get 20% markup" (no category condition)
-- Result: ✅ Rule applies based on other conditions
```

## Alternative Approach: More Explicit Logic

If you want even clearer logic, we could handle it like this:

```sql
-- Category matching with explicit logic
AND (
  -- Rule has no category requirement
  pr.conditions->'category_ids' IS NULL
  OR
  -- Rule requires category AND product has matching category  
  (
    pr.conditions->'category_ids' IS NOT NULL 
    AND v_category_id IS NOT NULL
    AND pr.conditions->'category_ids' @> to_jsonb(v_category_id)
  )
)
```

## Real-World Examples

### Example 1: Category-Specific Rule
```json
{
  "name": "TV Markup Rule",
  "conditions": {
    "category_ids": [1]  // Only applies to TVs
  },
  "formula": {
    "type": "proportional_markup",
    "lower_bound": 300,
    "lower_markup": 60,
    "upper_bound": 1500, 
    "upper_markup": 25
  }
}
```
- ✅ Samsung TV (category_id = 1) → Rule applies
- ❌ Custom item (category_id = NULL) → Rule doesn't apply

### Example 2: Brand-Only Rule
```json
{
  "name": "Samsung Brand Rule", 
  "conditions": {
    "attributes": [
      {
        "attribute_id": 5,
        "type": "options",
        "option_ids": [25]  // Samsung
      }
    ]
  },
  "formula": {
    "type": "proportional_markup",
    "lower_bound": 200,
    "lower_markup": 80,
    "upper_bound": 1000,
    "upper_markup": 30
  }
}
```
- ✅ Samsung TV (category_id = 1, brand = Samsung) → Rule applies
- ✅ Samsung custom item (category_id = NULL, brand = Samsung) → Rule applies
- ❌ LG TV (category_id = 1, brand = LG) → Rule doesn't apply

The corrected logic ensures that:
1. **Product must exist** (otherwise return empty)
2. **Category is optional** (NULL category doesn't break pricing)
3. **Rules can target specific categories or be universal**
4. **Other conditions still work** regardless of category