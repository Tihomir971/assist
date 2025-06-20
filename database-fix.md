# Database Fix for Pricing Rules (v5 - Final)

This file contains the necessary SQL functions to fix the database errors related to the pricing rules engine. This version fixes a "nested aggregate" error in the `get_product_attributes` function.

**Instructions:**
1.  Navigate to the **SQL Editor** in your Supabase dashboard.
2.  Copy the entire contents of this file.
3.  Paste the SQL into the editor.
4.  Click **"Run"** to create or replace the functions. This should be the final fix.

---

### 1. `get_product_attributes` Function (Corrected Aggregation)

```sql
DROP FUNCTION IF EXISTS get_product_attributes(integer);
DROP FUNCTION IF EXISTS get_product_attributes(bigint);

CREATE OR REPLACE FUNCTION get_product_attributes(p_product_id bigint)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB := '{}';
  option_attrs JSONB;
  value_attrs JSONB;
BEGIN
  -- This function assumes the existence of 'm_product_attribute_option' and 'm_product_attribute_value' tables.
  
  -- Get single-select and multi-select attributes using a CTE to avoid nested aggregates
  WITH option_agg AS (
    SELECT
      pao.attribute_id,
      COUNT(*) as option_count,
      MIN(pao.option_id) as single_option,
      jsonb_agg(pao.option_id) as all_options
    FROM m_product_attribute_option pao
    JOIN m_attribute a ON a.id = pao.attribute_id
    WHERE pao.product_id = p_product_id
      AND pao.is_active = true
      AND a.attribute_type IN ('single_select', 'multi_select')
    GROUP BY pao.attribute_id
  )
  SELECT jsonb_object_agg(
    attribute_id::text,
    CASE
      WHEN option_count = 1 THEN to_jsonb(single_option)
      ELSE all_options
    END
  )
  INTO option_attrs
  FROM option_agg;

  -- Add number, boolean, date attributes
  SELECT jsonb_object_agg(
    pav.attribute_id::text,
    CASE a.attribute_type
      WHEN 'number' THEN to_jsonb(pav.number_value)
      WHEN 'boolean' THEN to_jsonb(pav.boolean_value)
      WHEN 'date' THEN to_jsonb(pav.date_value)
      ELSE to_jsonb(pav.text_value)
    END
  )
  INTO value_attrs
  FROM m_product_attribute_value pav
  JOIN m_attribute a ON a.id = pav.attribute_id  
  WHERE pav.product_id = p_product_id
    AND pav.is_active = true
    AND a.attribute_type IN ('number', 'boolean', 'date');
    
  -- Combine both types of attributes
  result := COALESCE(option_attrs, '{}'::jsonb) || COALESCE(value_attrs, '{}'::jsonb);
  
  RETURN result;
END;
$$;
```

---

### 2. `check_attributes_match` Function

```sql
DROP FUNCTION IF EXISTS check_attributes_match(jsonb, jsonb);

CREATE OR REPLACE FUNCTION check_attributes_match(
  p_rule_attributes JSONB,
  p_product_attributes JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  rule_cond RECORD;
  product_attr_value JSONB;
  match_found BOOLEAN;
BEGIN
  IF p_rule_attributes IS NULL OR jsonb_array_length(p_rule_attributes) = 0 THEN
    RETURN TRUE;
  END IF;
  
  IF p_product_attributes IS NULL OR p_product_attributes = '{}'::jsonb THEN
    RETURN FALSE;
  END IF;

  FOR rule_cond IN SELECT * FROM jsonb_to_recordset(p_rule_attributes) AS x(
    attribute_id INTEGER, 
    type TEXT, 
    option_ids JSONB, 
    min_value NUMERIC, 
    max_value NUMERIC, 
    exact_value NUMERIC
  )
  LOOP
    -- Check if the product has this attribute
    IF NOT (p_product_attributes ? rule_cond.attribute_id::text) THEN
      RETURN FALSE; -- Required attribute is missing on the product
    END IF;

    product_attr_value := p_product_attributes -> rule_cond.attribute_id::text;
    match_found := FALSE;

    IF rule_cond.type = 'options' THEN
      -- Handle both single option (jsonb number) and multi-option (jsonb array) on the product
      IF jsonb_typeof(product_attr_value) = 'number' THEN
        IF rule_cond.option_ids @> product_attr_value THEN
          match_found := TRUE;
        END IF;
      ELSIF jsonb_typeof(product_attr_value) = 'array' THEN
        -- Check for any intersection between the rule's options and the product's options
        IF (SELECT count(*) > 0 FROM jsonb_array_elements_text(rule_cond.option_ids) rule_opt
            WHERE EXISTS (SELECT 1 FROM jsonb_array_elements_text(product_attr_value) prod_opt WHERE prod_opt = rule_opt))
        THEN
            match_found := TRUE;
        END IF;
      END IF;
    ELSIF rule_cond.type = 'number' AND jsonb_typeof(product_attr_value) = 'number' THEN
      DECLARE
        val NUMERIC := product_attr_value::TEXT::NUMERIC;
      BEGIN
        IF (rule_cond.exact_value IS NULL OR val = rule_cond.exact_value) AND
           (rule_cond.min_value IS NULL OR val >= rule_cond.min_value) AND
           (rule_cond.max_value IS NULL OR val <= rule_cond.max_value) THEN
          match_found := TRUE;
        END IF;
      END;
    END IF;

    IF NOT match_found THEN
      RETURN FALSE;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$$;
```

---

### 3. `find_applicable_pricing_rules` Function

```sql
DROP FUNCTION IF EXISTS find_applicable_pricing_rules(integer, integer, integer, decimal, text);
DROP FUNCTION IF EXISTS find_applicable_pricing_rules(bigint, integer, integer, decimal, text);

CREATE OR REPLACE FUNCTION find_applicable_pricing_rules(
  p_product_id BIGINT,
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
      pr.conditions->>'max_quantity' IS NULL  
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