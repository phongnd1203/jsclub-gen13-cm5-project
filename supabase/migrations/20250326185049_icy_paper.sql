/*
  # Add profile columns and update trigger

  1. Changes
    - Add columns for profile data if they don't exist
    - Add update trigger for timestamp tracking
    
  2. Error Handling
    - Use separate statements for better error handling
    - Check for existing objects before creation
*/

-- Add columns if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create the update function
CREATE OR REPLACE FUNCTION handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_profile_update ON profiles;
CREATE TRIGGER on_profile_update
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_profile_update();