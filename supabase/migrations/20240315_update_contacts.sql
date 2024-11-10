-- Make category column nullable
ALTER TABLE contacts ALTER COLUMN category DROP NOT NULL;