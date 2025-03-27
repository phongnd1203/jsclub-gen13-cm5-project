/*
  # Add profile fields

  1. Changes
    - Add new columns to profiles table:
      - `bio` (text, nullable)
      - `avatar_url` (text, nullable)

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS avatar_url text;