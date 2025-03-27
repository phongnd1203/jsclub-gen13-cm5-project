/*
  # Add admin privileges for post deletion

  1. Changes
    - Add admin role check to users table
    - Update RLS policies for reviews table to allow admin deletion
    - Add function to check admin status

  2. Security
    - Only specific email can be admin
    - Admin can delete any review
    - Regular users can only delete their own reviews
*/

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id 
    AND email = 'linhdeptrai@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the delete policy for reviews
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete reviews" ON reviews
  FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid())
  );