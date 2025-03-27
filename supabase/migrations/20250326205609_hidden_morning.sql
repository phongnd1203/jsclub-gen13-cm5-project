/*
  # Add review likes functionality

  1. New Tables
    - `review_likes`
      - `review_id` (uuid, references reviews)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `review_likes` table
    - Add policies for viewing and managing likes
*/

CREATE TABLE IF NOT EXISTS review_likes (
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);

ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view likes
CREATE POLICY "Anyone can view review likes" ON review_likes
  FOR SELECT TO public
  USING (true);

-- Allow authenticated users to manage their likes
CREATE POLICY "Users can manage their review likes" ON review_likes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);