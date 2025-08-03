# Debug Query Test for Enhanced Document Generation

## Issue Analysis

The error "table name 'c_bpartner_location_l_location_1' specified more than once" suggests that Supabase is generating a complex join query that has duplicate table references.

## Expected Query Structure

For the relationship `c_bpartner` → `c_bpartner_location` → `l_location`, the correct Supabase query should be:

```sql
SELECT 
  name, phone, isbillto, isshipto,
  l_location(street_address_1, street_address_2)
FROM c_bpartner_location
WHERE c_bpartner_id = [entityId]
  AND is_active = true
ORDER BY name ASC
```

## Debugging Steps

1. **Check the generated select clause**: The current implementation creates:
   ```
   name, phone, isbillto, isshipto, l_location(street_address_1,street_address_2)
   ```

2. **Verify the foreign key relationship**: 
   - `c_bpartner_location.l_location_id` → `l_location.id`

3. **Test with simpler query first**: Try without the target table join to isolate the issue.

## Alternative Approach

If the current approach continues to fail, we could:

1. **Two-step approach**: 
   - First query: Get `c_bpartner_location` records
   - Second query: Get `l_location` records for each location_id
   - Merge the results in JavaScript

2. **Raw SQL approach**: Use Supabase's `.rpc()` method with a custom PostgreSQL function

## Test Context Schema (Simplified)

```json
{
  "roles": [
    {
      "name": "customer",
      "label": "Customer",
      "source_table": "c_bpartner",
      "linked_tables": [
        {
          "name": "locations",
          "relationship_type": "one_to_many",
          "join_table": "c_bpartner_location",
          "join_conditions": [
            {
              "local_field": "id",
              "foreign_field": "c_bpartner_id"
            }
          ],
          "include_join_fields": ["name", "phone", "isbillto", "isshipto"],
          "where_conditions": [
            {
              "field": "is_active",
              "operator": "eq",
              "value": true
            }
          ]
        }
      ]
    }
  ]
}
```

This simplified version removes the target table join to test if the basic join works first.