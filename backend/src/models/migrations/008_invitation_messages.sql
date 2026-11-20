ALTER TABLE invitations DROP COLUMN note;

CREATE TABLE invitation_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  sender_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body          varchar(2000) NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invitation_messages_thread_idx
  ON invitation_messages (invitation_id, created_at);
