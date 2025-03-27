/*
  # Add Comment Reactions

  1. New Tables
    - `comment_reactions`
      - `comment_id` (uuid, references comments.id)
      - `user_id` (uuid, references auth.users.id)
      - `emoji` (text)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `comment_reactions` table
    - Add policies for authenticated users to manage their reactions
*/

CREATE TABLE IF NOT EXISTS comment_reactions (
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (comment_id, user_id, emoji)
);

ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- Allow users to view all reactions
CREATE POLICY "Anyone can view reactions" ON comment_reactions
  FOR SELECT TO public
  USING (true);

-- Allow authenticated users to manage their own reactions
CREATE POLICY "Users can manage their reactions" ON comment_reactions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);