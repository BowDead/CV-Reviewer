ALTER TABLE invitations
  ADD COLUMN candidate_read_at timestamptz,
  ADD COLUMN employer_read_at timestamptz;
