-- Fix the options seeding to handle the foreign key relationships properly
-- Add sandwich options (Cold/Toasted)
INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Cold', base_price, 1 FROM menu_items WHERE name IN ('Cheese and Tomato', 'Cheese and Onion') AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Toasted', base_price + 0.50, 2 FROM menu_items WHERE name IN ('Cheese and Tomato', 'Cheese and Onion') AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Cold', base_price, 1 FROM menu_items WHERE name IN ('Ham & Cheese', 'Ham & Salad', 'Tuna & Cucumber') AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Toasted', base_price + 0.50, 2 FROM menu_items WHERE name IN ('Ham & Cheese', 'Ham & Salad', 'Tuna & Cucumber') AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Cold', 4.80, 1 FROM menu_items WHERE name = 'BLT' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Toasted', 5.30, 2 FROM menu_items WHERE name = 'BLT' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Cold', 5.50, 1 FROM menu_items WHERE name = 'Chicken Salad' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Toasted', 6.00, 2 FROM menu_items WHERE name = 'Chicken Salad' AND has_options = true
ON CONFLICT DO NOTHING;

-- Add chips options (Small/Large)
INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Small', base_price, 1 FROM menu_items WHERE name = 'Plain Chips' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Large', 3.50, 2 FROM menu_items WHERE name = 'Plain Chips' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Small', 2.90, 1 FROM menu_items WHERE name = 'Cajun Chips' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Large', 3.90, 2 FROM menu_items WHERE name = 'Cajun Chips' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Small', 3.50, 1 FROM menu_items WHERE name = 'Chips W/Cheesy Sauce' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Large', 4.50, 2 FROM menu_items WHERE name = 'Chips W/Cheesy Sauce' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Small', 4.00, 1 FROM menu_items WHERE name = 'Bacon & Cheese Sauce' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Large', 5.00, 2 FROM menu_items WHERE name = 'Bacon & Cheese Sauce' AND has_options = true
ON CONFLICT DO NOTHING;

-- Add burger options (1/4, 1/2)
INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, '1/4', base_price, 1 FROM menu_items WHERE category_id = (SELECT id FROM menu_categories WHERE slug = 'burgers') AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, '1/2', 
  CASE 
    WHEN name = 'Plain Burger' THEN 5.50
    WHEN name = 'Cheese Burger' THEN 6.00
    WHEN name = 'Bacon and Cheese Burger' THEN 7.00
    WHEN name = 'Egg Burger' THEN 7.50
    WHEN name = 'Chicken & Cheese Burger' THEN 6.50
    WHEN name = 'Veggie Burger' THEN 6.50
    WHEN name = 'Munch Burger' THEN 8.00
  END, 2 
FROM menu_items WHERE category_id = (SELECT id FROM menu_categories WHERE slug = 'burgers') AND has_options = true
ON CONFLICT DO NOTHING;

-- Add wrap options
INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Wrap Only', base_price, 1 FROM menu_items WHERE category_id = (SELECT id FROM menu_categories WHERE slug = 'wraps') AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'With Chips', base_price + 1.50, 2 FROM menu_items WHERE category_id = (SELECT id FROM menu_categories WHERE slug = 'wraps') AND has_options = true
ON CONFLICT DO NOTHING;

-- Add specials options (Rice/Chips for curry items)
INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Rice', base_price, 1 FROM menu_items WHERE name IN ('Chicken Tikka Curry', 'Chicken Katsu Curry', 'Chilli con carne', 'Fajita Chicken Meal') AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Chips', base_price, 2 FROM menu_items WHERE name IN ('Chicken Tikka Curry', 'Chicken Katsu Curry', 'Chilli con carne', 'Fajita Chicken Meal') AND has_options = true
ON CONFLICT DO NOTHING;

-- Add hot drink options (Small/Large)
INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Small', base_price, 1 FROM menu_items WHERE name = 'Tea' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Large', 2.00, 2 FROM menu_items WHERE name = 'Tea' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Small', 2.50, 1 FROM menu_items WHERE name IN ('Latte', 'Cappuccino', 'Mocha') AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Large', 3.20, 2 FROM menu_items WHERE name IN ('Latte', 'Cappuccino', 'Mocha') AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Small', 2.00, 1 FROM menu_items WHERE name = 'Americano' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Large', 2.70, 2 FROM menu_items WHERE name = 'Americano' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Small', 2.30, 1 FROM menu_items WHERE name = 'Hot Chocolate' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Large', 3.00, 2 FROM menu_items WHERE name = 'Hot Chocolate' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Small', 2.20, 1 FROM menu_items WHERE name = 'Flat White' AND has_options = true
ON CONFLICT DO NOTHING;

INSERT INTO menu_item_options (menu_item_id, option_name, price, display_order) 
SELECT id, 'Large', 3.00, 2 FROM menu_items WHERE name = 'Flat White' AND has_options = true
ON CONFLICT DO NOTHING;
