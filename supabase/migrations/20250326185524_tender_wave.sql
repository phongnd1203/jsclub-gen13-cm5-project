/*
  # Update comments table policies

  1. Changes
    - Enable RLS on comments table
    - Add foreign key constraint for user_id
    - Add policies for CRUD operations
    
  2. Security
    - Enable RLS
    - Add policies for viewing, creating, updating, and deleting comments
*/

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraints if they don't exist
ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comments_user_id_fkey,
ADD CONSTRAINT comments_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- Create policies for comments
CREATE POLICY "Anyone can view comments"
ON comments FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
ON comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);