/*
  # Add phone number to profiles

  1. Changes
    - Add phone_number column to profiles table
    - Make it nullable to support existing profiles
    
  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone_number text;