/*
  # Fix comment replies table and policies

  1. Changes
    - Drop existing policies if they exist
    - Recreate policies with proper permissions
    
  2. Security
    - Maintain RLS
    - Keep same policy rules for viewing and managing replies
*/

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view replies" ON comment_replies;
  DROP POLICY IF EXISTS "Users can create replies" ON comment_replies;
  DROP POLICY IF EXISTS "Users can update own replies" ON comment_replies;
  DROP POLICY IF EXISTS "Users can delete own replies" ON comment_replies;
END $$;

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS comment_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE comment_replies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view replies"
ON comment_replies FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can create replies"
ON comment_replies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own replies"
ON comment_replies FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies"
ON comment_replies FOR DELETE
TO authenticated
USING (auth.uid() = user_id);