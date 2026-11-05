CREATE TYPE user_role AS ENUM ('candidate', 'employer', 'admin');

CREATE TABLE users (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  email            varchar(254) NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash    text         NOT NULL,
  role             user_role    NOT NULL,
  is_blocked       boolean      NOT NULL DEFAULT false,
  data_key_enc     bytea        NOT NULL,
  github_login_enc bytea,
  created_at       timestamptz  NOT NULL DEFAULT now()
);