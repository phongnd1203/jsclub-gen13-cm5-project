/*
  # Fix comments table relationships

  1. Changes
    - Add foreign key constraint between comments and users tables
    - Update RLS policies to ensure proper access control
    
  2. Security
    - Maintain RLS policies for comments table
*/

-- Drop existing foreign key if it exists
ALTER TABLE comments 
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

-- Add the correct foreign key constraint
ALTER TABLE comments
ADD CONSTRAINT comments_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- Recreate policies with correct permissions
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