-- Insert breakfast items
INSERT INTO menu_items (category_id, name, description, base_price, is_custom_builder, display_order) VALUES
((SELECT id FROM menu_categories WHERE slug = 'breakfast'), 'Build Your Breakfast', 'Choose your bread, fillings & sauce', 4.00, true, 1);

-- Insert sandwich items
INSERT INTO menu_items (category_id, name, base_price, has_options, display_order) VALUES
((SELECT id FROM menu_categories WHERE slug = 'sandwiches'), 'Cheese and Tomato', 4.00, true, 1),
((SELECT id FROM menu_categories WHERE slug = 'sandwiches'), 'Cheese and Onion', 4.00, true, 2),
((SELECT id FROM menu_categories WHERE slug = 'sandwiches'), 'Ham & Cheese', 4.50, true, 3),
((SELECT id FROM menu_categories WHERE slug = 'sandwiches'), 'Ham & Salad', 4.50, true, 4),
((SELECT id FROM menu_categories WHERE slug = 'sandwiches'), 'Tuna & Cucumber', 4.50, true, 5),
((SELECT id FROM menu_categories WHERE slug = 'sandwiches'), 'BLT', 4.80, true, 6),
((SELECT id FROM menu_categories WHERE slug = 'sandwiches'), 'Chicken Salad', 5.50, true, 7);

-- Insert chips items
INSERT INTO menu_items (category_id, name, base_price, has_options, display_order) VALUES
((SELECT id FROM menu_categories WHERE slug = 'chips'), 'Plain Chips', 2.50, true, 1),
((SELECT id FROM menu_categories WHERE slug = 'chips'), 'Cajun Chips', 2.90, true, 2),
((SELECT id FROM menu_categories WHERE slug = 'chips'), 'Chips W/Cheesy Sauce', 3.50, true, 3),
((SELECT id FROM menu_categories WHERE slug = 'chips'), 'Bacon & Cheese Sauce', 4.00, true, 4);

INSERT INTO menu_items (category_id, name, description, base_price, display_order) VALUES
((SELECT id FROM menu_categories WHERE slug = 'chips'), 'Onion Rings', '10 pieces', 2.00, 5),
((SELECT id FROM menu_categories WHERE slug = 'chips'), 'Hash Browns', '2 pieces', 1.50, 6);

-- Insert burger items
INSERT INTO menu_items (category_id, name, base_price, has_options, display_order) VALUES
((SELECT id FROM menu_categories WHERE slug = 'burgers'), 'Plain Burger', 4.00, true, 1),
((SELECT id FROM menu_categories WHERE slug = 'burgers'), 'Cheese Burger', 4.50, true, 2),
((SELECT id FROM menu_categories WHERE slug = 'burgers'), 'Bacon and Cheese Burger', 5.50, true, 3),
((SELECT id FROM menu_categories WHERE slug = 'burgers'), 'Egg Burger', 6.00, true, 4),
((SELECT id FROM menu_categories WHERE slug = 'burgers'), 'Chicken & Cheese Burger', 5.00, true, 5),
((SELECT id FROM menu_categories WHERE slug = 'burgers'), 'Veggie Burger', 5.00, true, 6);

INSERT INTO menu_items (category_id, name, description, base_price, has_options, display_order) VALUES
((SELECT id FROM menu_categories WHERE slug = 'burgers'), 'Munch Burger', 'Bacon, cheese, egg & hash brown', 6.50, true, 7);

-- Insert wrap items
INSERT INTO menu_items (category_id, name, description, base_price, has_options, display_order) VALUES
((SELECT id FROM menu_categories WHERE slug = 'wraps'), 'Munch Fajita', 'Chicken, peppers & onion', 5.50, true, 1),
((SELECT id FROM menu_categories WHERE slug = 'wraps'), 'Veggie', '', 5.00, true, 2),
((SELECT id FROM menu_categories WHERE slug = 'wraps'), 'Breakfast', '', 5.50, true, 3);

-- Insert specials
INSERT INTO menu_items (category_id, name, base_price, has_options, display_order) VALUES
((SELECT id FROM menu_categories WHERE slug = 'specials'), 'Chicken Tikka Curry', 6.50, true, 1),
((SELECT id FROM menu_categories WHERE slug = 'specials'), 'Chicken Katsu Curry', 6.00, true, 2),
((SELECT id FROM menu_categories WHERE slug = 'specials'), 'Chilli con carne', 6.50, true, 3),
((SELECT id FROM menu_categories WHERE slug = 'specials'), 'Fajita Chicken Meal', 6.50, true, 4);

INSERT INTO menu_items (category_id, name, base_price, display_order) VALUES
((SELECT id FROM menu_categories WHERE slug = 'specials'), 'Chicken, Bacon & Cheese baguette', 6.50, 5);

INSERT INTO menu_items (category_id, name, description, base_price, display_order) VALUES
((SELECT id FROM menu_categories WHERE slug = 'specials'), 'Traditional breakfast box', 'Bacon, sausage, egg, mushrooms, hash brown, beans & toast', 6.90, 6),
((SELECT id FROM menu_categories WHERE slug = 'specials'), 'Full house Breakfast Box', '2 bacon, 2 sausages, 2 eggs, mushrooms, 2 hashbrowns, beans & toast', 8.40, 7);

-- Insert hot dogs
INSERT INTO menu_items (category_id, name, base_price, display_order) VALUES
((SELECT id FROM menu_categories WHERE slug = 'hotdogs'), 'Classic Dog', 4.30, 1);

INSERT INTO menu_items (category_id, name, description, base_price, display_order) VALUES
((SELECT id FROM menu_categories WHERE slug = 'hotdogs'), 'Munch Dog', 'Bacon, Cheese & Onions', 5.50, 2);

-- Insert hot drinks
INSERT INTO menu_items (category_id, name, base_price, has_options, display_order) VALUES
((SELECT id FROM menu_categories WHERE slug = 'hotdrinks'), 'Tea', 1.50, true, 1),
((SELECT id FROM menu_categories WHERE slug = 'hotdrinks'), 'Latte', 2.50, true, 2),
((SELECT id FROM menu_categories WHERE slug = 'hotdrinks'), 'Cappuccino', 2.50, true, 3),
((SELECT id FROM menu_categories WHERE slug = 'hotdrinks'), 'Mocha', 2.50, true, 4),
((SELECT id FROM menu_categories WHERE slug = 'hotdrinks'), 'Americano', 2.00, true, 5),
((SELECT id FROM menu_categories WHERE slug = 'hotdrinks'), 'Hot Chocolate', 2.30, true, 6),
((SELECT id FROM menu_categories WHERE slug = 'hotdrinks'), 'Flat White', 2.20, true, 7);

INSERT INTO menu_items (category_id, name, base_price, display_order) VALUES
((SELECT id FROM menu_categories WHERE slug = 'hotdrinks'), 'Espresso', 1.50, 8),
((SELECT id FROM menu_categories WHERE slug = 'hotdrinks'), 'Double Espresso', 2.00, 9),
((SELECT id FROM menu_categories WHERE slug = 'hotdrinks'), 'Add Syrup', 0.50, 10);

-- Insert cold drinks
INSERT INTO menu_items (category_id, name, base_price, display_order) VALUES
((SELECT id FROM menu_categories WHERE slug = 'colddrinks'), 'Water', 1.50, 1),
((SELECT id FROM menu_categories WHERE slug = 'colddrinks'), 'Coke', 2.00, 2),
((SELECT id FROM menu_categories WHERE slug = 'colddrinks'), 'Diet Coke', 2.00, 3),
((SELECT id FROM menu_categories WHERE slug = 'colddrinks'), 'Red Bull', 4.50, 4),
((SELECT id FROM menu_categories WHERE slug = 'colddrinks'), 'Monster', 4.50, 5);
