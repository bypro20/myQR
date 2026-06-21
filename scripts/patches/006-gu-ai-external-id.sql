-- GU AI entegrasyonu: Organization.externalId
ALTER TABLE Organization ADD COLUMN externalId TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS Organization_externalId_key ON Organization(externalId);
