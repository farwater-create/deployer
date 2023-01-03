"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whitelist = void 0;
const axios_1 = __importDefault(require("axios"));
const discord_js_1 = require("discord.js");
const logger_1 = __importDefault(require("../lib/logger"));
const minecraft_1 = require("../lib/minecraft");
const prisma_1 = __importDefault(require("../lib/prisma"));
const whitelist_embed_1 = require("../templates/whitelist-embed");
exports.whitelist = {
    json: new discord_js_1.SlashCommandBuilder()
        .setName("whitelist")
        .setDescription("whitelist your minecraft account")
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName("username")
        .setDescription("new minecraft username")
        .setRequired(true))
        .toJSON(),
    handler: async function (interaction) {
        await interaction.deferReply({
            ephemeral: true,
        });
        const application = await prisma_1.default.whitelistApplication.findFirst({
            where: {
                discordID: interaction.user.id,
            },
        });
        if (!application) {
            await interaction.followUp({
                content: "You need to submit an application first.",
                ephemeral: true,
            });
            return;
        }
        if (application.status != "accepted") {
            await interaction.followUp({
                content: "Your application is still awaiting approval.",
                ephemeral: true,
            });
            return;
        }
        const username = `${interaction.options.get("username", true).value}`;
        let profile;
        try {
            profile = await (0, minecraft_1.fetchUUID)(username);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                logger_1.default.error(`Error fetching uuid - ${error.code}: ${error.response?.data}`);
            }
            else {
                logger_1.default.error(error);
            }
            await interaction.followUp({
                content: "Minecraft account not found.",
                ephemeral: true,
            });
            return;
        }
        try {
            const exists = await prisma_1.default.whitelistApplication.findFirst({
                where: {
                    minecraftUUID: profile.id,
                },
            });
            if (exists && exists.discordID != interaction.user.id) {
                await interaction.followUp({
                    content: "Someone else already whitelisted that account.",
                    ephemeral: true,
                });
                return;
            }
        }
        catch (error) {
            console.error(error);
            await interaction.followUp({
                content: "Internal server error",
                ephemeral: true,
            });
        }
        if (application.minecraftUUID === profile.id) {
            try {
                await (0, minecraft_1.whitelistAccount)({ uuid: profile.id, name: profile.name });
                await interaction.followUp({
                    embeds: [(0, whitelist_embed_1.whitelistEmbed)(profile).setTitle("Whitelist")],
                    ephemeral: true,
                });
            }
            catch (error) {
                await interaction.followUp({
                    content: "Something went wrong. Is the server up?",
                    ephemeral: true,
                });
                console.error(error);
            }
            return;
        }
        const oldAccountProfile = await (0, minecraft_1.fetchUsername)(application.minecraftUUID);
        try {
            await (0, minecraft_1.unwhitelistAccount)({
                uuid: oldAccountProfile.id,
                name: oldAccountProfile.name,
            });
            await interaction.followUp({
                embeds: [
                    (0, whitelist_embed_1.whitelistEmbed)(oldAccountProfile).setTitle("Removed From Whitelist"),
                ],
                ephemeral: true,
            });
            await (0, minecraft_1.whitelistAccount)({ uuid: profile.id, name: profile.name });
            await prisma_1.default.whitelistApplication.updateMany({
                where: {
                    discordID: interaction.id,
                },
                data: {
                    minecraftUUID: profile.id,
                },
            });
            await interaction.followUp({
                embeds: [(0, whitelist_embed_1.whitelistEmbed)(profile)],
                ephemeral: true,
            });
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error))
                await interaction.followUp("Something went wrong.");
            else
                logger_1.default.error(error);
        }
    },
};
