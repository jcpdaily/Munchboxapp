-- This script removes duplicate menu item options for the same menu_item_id and option_name.
-- It keeps the oldest entry (lowest ID) for each unique combination.

DELETE FROM menu_item_options
WHERE id IN (
    SELECT id
    FROM (
        SELECT
            id,
            ROW_NUMBER() OVER (PARTITION BY menu_item_id, option_name ORDER BY id) as rn
        FROM menu_item_options
    ) AS subquery
    WHERE subquery.rn > 1
);
