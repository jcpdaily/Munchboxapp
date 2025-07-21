-- Fix any potential data consistency issues

-- Ensure all menu items with has_options=true have at least one option
UPDATE menu_items 
SET has_options = false 
WHERE has_options = true 
AND id NOT IN (
  SELECT DISTINCT menu_item_id 
  FROM menu_item_options 
  WHERE is_active = true
);

-- Ensure all menu item options reference valid menu items
DELETE FROM menu_item_options 
WHERE menu_item_id NOT IN (
  SELECT id FROM menu_items WHERE is_active = true
);

-- Update timestamps for consistency
UPDATE menu_items SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE orders SET updated_at = created_at WHERE updated_at IS NULL;

-- Ensure order numbers are unique (in case of duplicates)
UPDATE orders 
SET order_number = '#' || id || '-' || EXTRACT(epoch FROM created_at)::text
WHERE order_number IN (
  SELECT order_number 
  FROM orders 
  GROUP BY order_number 
  HAVING COUNT(*) > 1
);

-- Clean up any orphaned order items
DELETE FROM order_items 
WHERE order_id NOT IN (SELECT id FROM orders);

-- Ensure all prices are positive
UPDATE menu_items SET base_price = ABS(base_price) WHERE base_price < 0;
UPDATE menu_item_options SET price = ABS(price) WHERE price < 0;
UPDATE order_items SET unit_price = ABS(unit_price), total_price = ABS(total_price) WHERE unit_price < 0 OR total_price < 0;
UPDATE orders SET total_amount = ABS(total_amount) WHERE total_amount < 0;
