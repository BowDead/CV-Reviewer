DELETE FROM cvs;

ALTER TABLE cvs DROP COLUMN name_enc;
ALTER TABLE cvs DROP COLUMN content_enc;
ALTER TABLE cvs ADD COLUMN name varchar(255) NOT NULL;
ALTER TABLE cvs ADD COLUMN content text NOT NULL;

DELETE FROM user_repositories;

ALTER TABLE user_repositories DROP COLUMN data_enc;
ALTER TABLE user_repositories ADD COLUMN data jsonb NOT NULL;
