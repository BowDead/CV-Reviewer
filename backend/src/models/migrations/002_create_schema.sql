CREATE TYPE seniority_level     AS ENUM ('Stażysta', 'Junior', 'Mid', 'Senior', 'Lead');
CREATE TYPE skill_status        AS ENUM ('approved', 'pending', 'rejected');
CREATE TYPE invitation_status   AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE repo_status         AS ENUM ('pending', 'done', 'failed');
CREATE TYPE skill_source        AS ENUM ('system', 'llm');

CREATE TABLE llm_keys (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider    varchar(50) NOT NULL,
  model       varchar(100) NOT NULL,
  label       varchar(100),
  api_key_enc bytea NOT NULL,
  priority    int NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT llm_keys_priority_uk UNIQUE (user_id, priority) DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE cv_files (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_enc      bytea NOT NULL,
  file_name_enc bytea NOT NULL,
  mime_type     varchar(100) NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE analyses (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cv_file_id uuid REFERENCES cv_files(id) ON DELETE SET NULL,
  model      varchar(100) NOT NULL,
  language   varchar(10) NOT NULL,
  result_enc bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE skill_dict (
  id              int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name            varchar(100) NOT NULL UNIQUE,
  category        varchar(50),
  github_language varchar(50),
  aliases         jsonb NOT NULL DEFAULT '[]',
  status          skill_status NOT NULL DEFAULT 'pending'
);

CREATE TABLE candidate_profiles (
  user_id            uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  source_analysis_id uuid NOT NULL REFERENCES analyses(id) ON DELETE RESTRICT,
  headline           varchar(150),
  seniority          seniority_level,
  location           varchar(100),
  score              numeric(3,1),
  is_published       boolean NOT NULL DEFAULT false,
  published_at       timestamptz
);

CREATE TABLE profile_skills (
  candidate_id uuid REFERENCES candidate_profiles(user_id) ON DELETE CASCADE,
  skill_id     int  REFERENCES skill_dict(id) ON DELETE CASCADE,
  PRIMARY KEY (candidate_id, skill_id)
);

CREATE TABLE positions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       varchar(150) NOT NULL,
  description varchar(4000) NOT NULL,
  url         varchar(2048),
  is_blocked  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE position_skills (
  position_id uuid REFERENCES positions(id) ON DELETE CASCADE,
  skill_id    int  REFERENCES skill_dict(id) ON DELETE CASCADE,
  is_required boolean NOT NULL DEFAULT true,
  PRIMARY KEY (position_id, skill_id)
);

CREATE TABLE invitations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id  uuid NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note         varchar(2000),
  status       invitation_status NOT NULL DEFAULT 'pending',
  shared_cv_id uuid REFERENCES cv_files(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  UNIQUE (position_id, candidate_id)
);

CREATE TABLE user_repositories (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  github_repo_id bigint NOT NULL,
  data_enc       bytea,
  pushed_at      timestamptz,
  status         repo_status NOT NULL DEFAULT 'pending',
  analyzed_at    timestamptz,
  UNIQUE (user_id, github_repo_id)
);

CREATE TABLE repository_skills (
  repository_id uuid REFERENCES user_repositories(id) ON DELETE CASCADE,
  skill_id      int  REFERENCES skill_dict(id) ON DELETE CASCADE,
  source        skill_source NOT NULL,
  PRIMARY KEY (repository_id, skill_id)
);

CREATE TABLE offer_insights (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id         uuid NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  solidjobs_offer_key uuid NOT NULL,
  comment_enc         bytea NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (analysis_id, solidjobs_offer_key)
);

CREATE TABLE reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   uuid REFERENCES users(id) ON DELETE SET NULL,
  invitation_id uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  reason        varchar(1000) NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  resolved_at   timestamptz
);
