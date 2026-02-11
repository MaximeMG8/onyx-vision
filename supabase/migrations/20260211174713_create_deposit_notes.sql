/*
  # Create deposit notes table

  1. New Tables
    - `deposit_notes`
      - `id` (uuid, primary key) - Unique identifier
      - `deposit_id` (text, not null) - Reference to the deposit
      - `user_id` (uuid, not null) - User who created the note
      - `note` (text) - The note text (e.g., 'Igol Watch')
      - `created_at` (timestamptz) - Timestamp when note was created
      - `updated_at` (timestamptz) - Timestamp when note was last updated
  
  2. Security
    - Enable RLS on `deposit_notes` table
    - Users can only view/edit notes for their own deposits
*/

CREATE TABLE IF NOT EXISTS deposit_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id text NOT NULL,
  user_id uuid NOT NULL,
  note text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deposit_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deposit notes"
  ON deposit_notes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create deposit notes"
  ON deposit_notes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own deposit notes"
  ON deposit_notes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own deposit notes"
  ON deposit_notes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
