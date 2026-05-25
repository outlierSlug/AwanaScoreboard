-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RoundResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roundId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "place" INTEGER,
    "pointsAwarded" REAL NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoundResult_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoundResult_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RoundResult" ("createdAt", "id", "note", "place", "pointsAwarded", "roundId", "teamId") SELECT "createdAt", "id", "note", "place", "pointsAwarded", "roundId", "teamId" FROM "RoundResult";
DROP TABLE "RoundResult";
ALTER TABLE "new_RoundResult" RENAME TO "RoundResult";
CREATE UNIQUE INDEX "RoundResult_roundId_teamId_key" ON "RoundResult"("roundId", "teamId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
