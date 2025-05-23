/*
  # Update Categories and Tags

  1. Changes
    - Add category_id to restaurants table if it doesn't exist
    - Insert default categories and tags if they don't exist
    
  2. Security
    - Ensure RLS policies exist for all tables
*/

-- Add category_id to restaurants if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants'
    AND column_name = 'category_id'
  ) THEN
    ALTER TABLE restaurants
    ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Insert default categories if they don't exist
INSERT INTO categories (name, description)
VALUES
  ('Breakfast', 'Morning meals and breakfast spots'),
  ('Lunch', 'Lunch restaurants and casual dining'),
  ('Snacks', 'Quick bites and street food'),
  ('Coffee', 'Cafes and coffee shops')
ON CONFLICT (name) DO NOTHING;

-- Insert common tags if they don't exist
INSERT INTO tags (name)
VALUES
  ('Vegetarian'),
  ('Vegan'),
  ('Spicy'),
  ('Sweet'),
  ('Healthy'),
  ('Fast Food'),
  ('Traditional'),
  ('Fusion'),
  ('Budget Friendly'),
  ('Family Style')
ON CONFLICT (name) DO NOTHING;

-- Ensure RLS is enabled on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON tags;
DROP POLICY IF EXISTS "Admins can manage tags" ON tags;
DROP POLICY IF EXISTS "Restaurant tags are viewable by everyone" ON restaurant_tags;
DROP POLICY IF EXISTS "Users can manage tags for their restaurants" ON restaurant_tags;

-- Create policies for categories
CREATE POLICY "Categories are viewable by everyone"
ON categories FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage categories"
ON categories FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Create policies for tags
CREATE POLICY "Tags are viewable by everyone"
ON tags FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage tags"
ON tags FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Create policies for restaurant_tags
CREATE POLICY "Restaurant tags are viewable by everyone"
ON restaurant_tags FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can manage tags for their restaurants"
ON restaurant_tags FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = restaurant_tags.restaurant_id
    AND EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.restaurant_id = restaurants.id
      AND reviews.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = restaurant_tags.restaurant_id
    AND EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.restaurant_id = restaurants.id
      AND reviews.user_id = auth.uid()
    )
  )
);