/*
  # Add post likes functionality

  1. New Tables
    - `post_likes`
      - `restaurant_id` (uuid, references restaurants)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `post_likes` table
    - Add policies for viewing and managing likes
*/

CREATE TABLE IF NOT EXISTS post_likes (
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (restaurant_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view likes
CREATE POLICY "Anyone can view likes" ON post_likes
  FOR SELECT TO public
  USING (true);

-- Allow authenticated users to manage their likes
CREATE POLICY "Users can manage their likes" ON post_likes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);