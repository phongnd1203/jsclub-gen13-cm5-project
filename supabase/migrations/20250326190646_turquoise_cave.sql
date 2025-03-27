/*
  # Add ratings functionality

  1. Changes
    - Drop existing ratings table and related objects if they exist
    - Create new ratings table with proper constraints
    - Add RLS policies
    - Create function to calculate average rating

  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Add policy for public viewing
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_restaurant_rating(uuid);

-- Drop existing table and its dependencies if they exist
DROP TABLE IF EXISTS ratings CASCADE;

-- Create ratings table
CREATE TABLE ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);

-- Enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view ratings"
ON ratings FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can create ratings"
ON ratings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
ON ratings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
ON ratings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create function to calculate average rating
CREATE OR REPLACE FUNCTION get_restaurant_rating(restaurant_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(ROUND(AVG(score)::numeric, 1), 0.0)
  FROM ratings
  WHERE ratings.restaurant_id = $1;
$$;