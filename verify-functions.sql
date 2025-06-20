-- Use this SQL query to verify if the required pricing rule functions exist in your database.
--
-- Instructions:
-- 1. Go to the SQL Editor in your Supabase dashboard.
-- 2. Copy and paste the query below.
-- 3. Run the query.
--
-- Expected Result:
-- - If the functions were created successfully, you will see a table with three rows,
--   one for each function: 'get_product_attributes', 'check_attributes_match', and 'find_applicable_pricing_rules'.
-- - If the result is an empty table, it means the functions were not created, and the
--   script in 'database-fix.md' needs to be run again.

SELECT
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments
FROM
  pg_proc p
JOIN
  pg_namespace n ON n.oid = p.pronamespace
WHERE
  n.nspname = 'public' -- Supabase default schema
  AND p.proname IN (
    'get_product_attributes',
    'check_attributes_match',
    'find_applicable_pricing_rules'
  );