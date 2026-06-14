ALTER TABLE "QrCode" ADD COLUMN "durationTier" TEXT NOT NULL DEFAULT 'FREE_TRIAL';
ALTER TABLE "QrCode" ADD COLUMN "expiresAt" DATETIME;

-- Mevcut dinamik QR'lara 15 günlük deneme süresi (oluşturulma tarihinden)
UPDATE "QrCode"
SET "expiresAt" = datetime("createdAt", '+15 days')
WHERE "expiresAt" IS NULL
  AND "durationTier" = 'FREE_TRIAL'
  AND "mode" = 'DYNAMIC';
