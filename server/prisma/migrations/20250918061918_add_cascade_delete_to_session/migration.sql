-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Round" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Round_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Round_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Round" ("createdAt", "gameId", "id", "notes", "roundNumber", "sessionId") SELECT "createdAt", "gameId", "id", "notes", "roundNumber", "sessionId" FROM "Round";
DROP TABLE "Round";
ALTER TABLE "new_Round" RENAME TO "Round";
CREATE INDEX "Round_sessionId_roundNumber_idx" ON "Round"("sessionId", "roundNumber");
CREATE TABLE "new_SessionScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" REAL NOT NULL DEFAULT 0,
    "roundsPlayed" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionScore_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionScore_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SessionScore" ("createdAt", "id", "lastUpdated", "memberCount", "roundsPlayed", "sessionId", "teamId", "totalPoints") SELECT "createdAt", "id", "lastUpdated", "memberCount", "roundsPlayed", "sessionId", "teamId", "totalPoints" FROM "SessionScore";
DROP TABLE "SessionScore";
ALTER TABLE "new_SessionScore" RENAME TO "SessionScore";
CREATE INDEX "SessionScore_sessionId_idx" ON "SessionScore"("sessionId");
CREATE UNIQUE INDEX "SessionScore_sessionId_teamId_key" ON "SessionScore"("sessionId", "teamId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
