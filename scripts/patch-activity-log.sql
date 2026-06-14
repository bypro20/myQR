CREATE TABLE IF NOT EXISTS "ActivityLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "kind" TEXT NOT NULL,
  "actorUserId" TEXT,
  "actorName" TEXT,
  "actorEmail" TEXT,
  "actorRole" TEXT,
  "organizationId" TEXT,
  "targetType" TEXT,
  "targetId" TEXT,
  "targetLabel" TEXT,
  "message" TEXT NOT NULL,
  "metadata" TEXT NOT NULL DEFAULT '{}',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActivityLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "ActivityLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");
CREATE INDEX IF NOT EXISTS "ActivityLog_kind_idx" ON "ActivityLog"("kind");
CREATE INDEX IF NOT EXISTS "ActivityLog_actorUserId_idx" ON "ActivityLog"("actorUserId");
CREATE INDEX IF NOT EXISTS "ActivityLog_organizationId_idx" ON "ActivityLog"("organizationId");
