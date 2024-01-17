-- CreateTable
CREATE TABLE "OffensiveMinecraftSkin" (
    "hash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FarwaterUser" (
    "discordId" TEXT NOT NULL,
    "minecraftUuid" TEXT,
    "minecraftName" TEXT,
    "minecraftSkinSum" TEXT,
    "age" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MinecraftApplication" (
    "discordId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MinecraftApplication_discordId_fkey" FOREIGN KEY ("discordId") REFERENCES "FarwaterUser" ("discordId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "OffensiveMinecraftSkin_hash_key" ON "OffensiveMinecraftSkin"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "FarwaterUser_discordId_key" ON "FarwaterUser"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "MinecraftApplication_discordId_serverId_key" ON "MinecraftApplication"("discordId", "serverId");
