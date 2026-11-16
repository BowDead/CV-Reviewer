CREATE TYPE cv_source AS ENUM ('upload', 'creator');

DELETE FROM cv_files;

ALTER TABLE cv_files RENAME TO cvs;
ALTER TABLE cvs RENAME COLUMN file_name_enc TO name_enc;
ALTER TABLE cvs DROP COLUMN file_enc;
ALTER TABLE cvs DROP COLUMN mime_type;
ALTER TABLE cvs ADD COLUMN content_enc bytea NOT NULL;
ALTER TABLE cvs ADD COLUMN source cv_source NOT NULL DEFAULT 'upload';

ALTER TABLE analyses RENAME COLUMN cv_file_id TO cv_id;
