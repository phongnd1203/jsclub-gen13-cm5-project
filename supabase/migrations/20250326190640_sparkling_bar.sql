/*
  # Add ratings functionality

  1. Changes
    - Create ratings table if it doesn't exist
    - Add foreign key constraints
    - Enable RLS
    - Add policies for ratings management
    - Add function to calculate average rating

  2. Security
    - Drop existing policies to avoid conflicts
    - Recreate policies with proper permissions
    - Enable RLS
*/

-- Create ratings table if it doesn't exist
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);

-- Enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON ratings;
DROP POLICY IF EXISTS "Authenticated users can insert ratings" ON ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON ratings;

-- Create policies
CREATE POLICY "Ratings are viewable by everyone"
ON ratings FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can insert ratings"
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

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_restaurant_rating(uuid);

-- Create function to calculate average rating
CREATE OR REPLACE FUNCTION get_restaurant_rating(restaurant_id uuid)
RETURNS float
LANGUAGE plpgsql
AS $$
DECLARE
  avg_rating float;
BEGIN
  SELECT COALESCE(AVG(score)::numeric(10,1), 0.0)
  INTO avg_rating
  FROM ratings
  WHERE ratings.restaurant_id = $1;
  
  RETURN avg_rating;
END;
$$;