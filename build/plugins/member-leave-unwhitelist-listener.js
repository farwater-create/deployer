"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../lib/logger"));
const minecraft_1 = require("../lib/minecraft");
const prisma_1 = __importDefault(require("../lib/prisma"));
const deleteUserHandler = async (id) => {
    try {
        const application = await prisma_1.default.whitelistApplication.findFirst({
            where: {
                discordID: id,
            },
        });
        if (!application)
            return;
        const profile = await (0, minecraft_1.fetchUsername)(application.minecraftUUID);
        await (0, minecraft_1.unwhitelistAccount)({ uuid: id, name: profile.name });
        await prisma_1.default.whitelistApplication.deleteMany({
            where: {
                discordID: id,
            },
        });
    }
    catch (error) {
        logger_1.default.error(error);
    }
};
exports.default = (client) => {
    client.on("guildMemberRemove", (member) => deleteUserHandler(member.user.id));
    client.on("guildBanAdd", (ban) => deleteUserHandler(ban.user.id));
};
