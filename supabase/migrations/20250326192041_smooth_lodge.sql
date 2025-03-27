/*
  # Add Categories and Tags

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    
    - `restaurant_tags`
      - `restaurant_id` (uuid, foreign key)
      - `tag_id` (uuid, foreign key)
      - Primary key is (restaurant_id, tag_id)

  2. Changes
    - Add `category_id` to `restaurants` table
    
  3. Security
    - Enable RLS on all new tables
    - Add policies for public viewing
    - Add policies for admin management
*/

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

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

-- Create tags table
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

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

-- Create restaurant_tags junction table
CREATE TABLE restaurant_tags (
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (restaurant_id, tag_id)
);

-- Enable RLS
ALTER TABLE restaurant_tags ENABLE ROW LEVEL SECURITY;

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

-- Add category_id to restaurants
ALTER TABLE restaurants
ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE SET NULL;

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Breakfast', 'Morning meals and breakfast spots'),
('Lunch', 'Lunch restaurants and casual dining'),
('Snacks', 'Quick bites and street food'),
('Coffee', 'Cafes and coffee shops');

-- Insert common tags
INSERT INTO tags (name) VALUES
('Vegetarian'),
('Vegan'),
('Spicy'),
('Sweet'),
('Healthy'),
('Fast Food'),
('Traditional'),
('Fusion'),
('Budget Friendly'),
('Family Style');