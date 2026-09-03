-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meetup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activity" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "locationName" TEXT,
    "lat" REAL,
    "lng" REAL,
    "maxPeople" INTEGER NOT NULL DEFAULT 3,
    "duration" TEXT,
    "goAnyway" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'open',
    "message" TEXT,
    "cancelledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,
    CONSTRAINT "Meetup_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Meetup" ("activity", "cancelledAt", "createdAt", "creatorId", "id", "lat", "lng", "locationName", "maxPeople", "message", "startTime", "status") SELECT "activity", "cancelledAt", "createdAt", "creatorId", "id", "lat", "lng", "locationName", "maxPeople", "message", "startTime", "status" FROM "Meetup";
DROP TABLE "Meetup";
ALTER TABLE "new_Meetup" RENAME TO "Meetup";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
