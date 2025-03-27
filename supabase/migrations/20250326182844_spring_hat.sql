/*
  # Fix Restaurant Table RLS Policies

  1. Security Changes
    - Enable RLS on restaurants table
    - Allow authenticated users to insert restaurants
    - Allow public read access to all restaurants
    - Allow restaurant owners to update their restaurants
    - Allow admins to manage all restaurants
*/

-- Enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anyone can view restaurants" ON restaurants;
DROP POLICY IF EXISTS "Only admins can delete restaurants" ON restaurants;
DROP POLICY IF EXISTS "Only admins can insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Only admins can modify restaurants" ON restaurants;
DROP POLICY IF EXISTS "Only admins can update restaurants" ON restaurants;
DROP POLICY IF EXISTS "Public can view restaurants" ON restaurants;
DROP POLICY IF EXISTS "Restaurants are viewable by everyone" ON restaurants;

-- Create new policies
CREATE POLICY "Public can view restaurants"
ON restaurants FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create restaurants"
ON restaurants FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update own restaurants"
ON restaurants FOR UPDATE
TO authenticated
USING (auth.uid() IN (
  SELECT user_id FROM reviews WHERE restaurant_id = restaurants.id
))
WITH CHECK (auth.uid() IN (
  SELECT user_id FROM reviews WHERE restaurant_id = restaurants.id
));

CREATE POLICY "Users can delete own restaurants"
ON restaurants FOR DELETE
TO authenticated
USING (auth.uid() IN (
  SELECT user_id FROM reviews WHERE restaurant_id = restaurants.id
));

CREATE POLICY "Admins can manage restaurants"
ON restaurants FOR ALL
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