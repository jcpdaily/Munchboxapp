-- This script removes duplicate menu items and their associated options.
-- It keeps the oldest entry (lowest ID) for each unique combination of name and category.

-- Step 1: Delete menu_item_options that belong to duplicate menu_items
-- We identify menu_item_ids that are NOT the minimum ID for their name/category group.
DELETE FROM menu_item_options
WHERE menu_item_id IN (
    SELECT mi.id
    FROM menu_items mi
    WHERE mi.id NOT IN (
        SELECT MIN(id)
        FROM menu_items
        GROUP BY name, category_id
    )
);

-- Step 2: Delete the duplicate menu_items themselves
-- We keep only the menu_item with the lowest ID for each unique name and category_id.
DELETE FROM menu_items
WHERE id NOT IN (
    SELECT MIN(id)
    FROM menu_items
    GROUP BY name, category_id
);
