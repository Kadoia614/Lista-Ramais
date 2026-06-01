ALTER TABLE "User" ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lockedAt" DATETIME;

CREATE INDEX "User_lockedAt_idx" ON "User"("lockedAt");
