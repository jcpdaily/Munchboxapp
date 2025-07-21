-- Insert menu categories
INSERT INTO menu_categories (name, slug, display_order) VALUES
('Build Your Breakfast', 'breakfast', 1),
('Cold Sandwiches', 'sandwiches', 2),
('Chips & Sides', 'chips', 3),
('Burgers', 'burgers', 4),
('Wraps', 'wraps', 5),
('Specials', 'specials', 6),
('Hot Dogs', 'hotdogs', 7),
('Hot Drinks', 'hotdrinks', 8),
('Cold Drinks', 'colddrinks', 9)
ON CONFLICT (slug) DO NOTHING;
