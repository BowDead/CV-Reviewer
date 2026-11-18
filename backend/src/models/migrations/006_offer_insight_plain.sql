DELETE FROM offer_insights;

ALTER TABLE offer_insights DROP COLUMN comment_enc;
ALTER TABLE offer_insights ADD COLUMN comment text NOT NULL;
