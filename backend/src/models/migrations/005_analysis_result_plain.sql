DELETE FROM candidate_profiles;
DELETE FROM analyses;

ALTER TABLE analyses DROP COLUMN result_enc;
ALTER TABLE analyses ADD COLUMN result jsonb NOT NULL;
