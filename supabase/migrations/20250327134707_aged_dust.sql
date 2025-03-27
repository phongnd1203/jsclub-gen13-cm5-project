/*
  # Add comment replies functionality

  1. New Tables
    - `comment_replies`
      - `id` (uuid, primary key)
      - `comment_id` (uuid, references comments)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for viewing and managing replies
*/

CREATE TABLE IF NOT EXISTS comment_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE comment_replies ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view replies
CREATE POLICY "Anyone can view replies"
ON comment_replies FOR SELECT
TO public
USING (true);

-- Allow authenticated users to create replies
CREATE POLICY "Users can create replies"
ON comment_replies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own replies
CREATE POLICY "Users can update own replies"
ON comment_replies FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own replies
CREATE POLICY "Users can delete own replies"
ON comment_replies FOR DELETE
TO authenticated
USING (auth.uid() = user_id);