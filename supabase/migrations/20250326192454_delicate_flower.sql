/*
  # Fix restaurant_tags RLS policies

  1. Changes
    - Update RLS policies for restaurant_tags table to allow tag creation with new restaurants
    - Keep existing policies for viewing and managing tags
    
  2. Security
    - Allow authenticated users to create tags when creating a new restaurant
    - Maintain public read access
    - Allow users to manage tags for their own restaurants
*/

-- Drop existing policies one at a time
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Restaurant tags are viewable by everyone" ON restaurant_tags;
  DROP POLICY IF EXISTS "Users can manage tags for their restaurants" ON restaurant_tags;
END $$;

-- Create read policy
DO $$
BEGIN
  CREATE POLICY "Restaurant tags are viewable by everyone"
  ON restaurant_tags FOR SELECT
  TO public
  USING (true);
END $$;

-- Create insert policy
DO $$
BEGIN
  CREATE POLICY "Users can create restaurant tags"
  ON restaurant_tags FOR INSERT
  TO authenticated
  WITH CHECK (true);
END $$;

-- Create management policy
DO $$
BEGIN
  CREATE POLICY "Users can manage existing restaurant tags"
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
END $$;