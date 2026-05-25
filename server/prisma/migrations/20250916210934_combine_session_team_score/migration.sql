/*
  Warnings:

  - You are about to drop the `SessionTeam` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SessionTeam";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SessionScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" REAL NOT NULL DEFAULT 0,
    "roundsPlayed" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionScore_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SessionScore_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SessionScore_sessionId_idx" ON "SessionScore"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionScore_sessionId_teamId_key" ON "SessionScore"("sessionId", "teamId");
