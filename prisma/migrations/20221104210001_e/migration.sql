-- CreateTable
CREATE TABLE "WhitelistApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "age" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "minecraftUUID" TEXT NOT NULL,
    "discordID" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "transfers" INTEGER NOT NULL DEFAULT 4
);
