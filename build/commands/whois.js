"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whois = void 0;
const discord_js_1 = require("discord.js");
const logger_1 = __importDefault(require("../lib/logger"));
const minecraft_1 = require("../lib/minecraft");
const prisma_1 = __importDefault(require("../lib/prisma"));
const user_embed_1 = require("../templates/user-embed");
exports.whois = {
    json: new discord_js_1.SlashCommandBuilder()
        .setName("whois")
        .setDescription("Find out who a user is")
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setDescription("a discord account")
        .setName("discord"))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setDescription("a minecraft account")
        .setName("minecraft"))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.BanMembers)
        .toJSON(),
    handler: async function (interaction) {
        await interaction.deferReply();
        let user = interaction.options.getUser("discord", false);
        const minecraftUsername = interaction.options
            .get("minecraft", false)
            ?.value?.toString();
        if (!user && !minecraftUsername) {
            await interaction.followUp({
                content: "you must provide a value for discord user or minecraft username",
                ephemeral: true,
            });
            return;
        }
        let minecraftAccount;
        let application;
        if (minecraftUsername) {
            try {
                minecraftAccount = await (0, minecraft_1.fetchUUID)(minecraftUsername);
            }
            catch (error) {
                logger_1.default.error(error);
                return;
            }
            application = await prisma_1.default.whitelistApplication.findFirst({
                where: {
                    minecraftUUID: minecraftAccount.id,
                },
            });
            if (!application) {
                await interaction.followUp({
                    content: `user ${minecraftUsername} is not part of Farwater`,
                    ephemeral: true,
                });
                return;
            }
            user =
                interaction.client.users.cache.get(application.discordID) ||
                    (await interaction.client.users.fetch(application.discordID));
            if (!user) {
                await interaction.followUp({
                    content: `the user associated with this account is not on the server`,
                    ephemeral: true,
                });
            }
        }
        else if (user) {
            application = await prisma_1.default.whitelistApplication.findFirst({
                where: {
                    discordID: user.id,
                },
            });
            if (!application) {
                await interaction.followUp({
                    content: `user ${user.username} is not registered.`,
                    ephemeral: true,
                });
                return;
            }
            try {
                minecraftAccount = await (0, minecraft_1.fetchUsername)(application?.minecraftUUID);
            }
            catch {
                await interaction.followUp({
                    content: `error while fetching ${user.username}'s minecraft account`,
                    ephemeral: true,
                });
                return;
            }
        }
        else {
            await interaction.followUp({
                content: "Internal server error",
                ephemeral: true,
            });
            return;
        }
        if (!application || !user) {
            await interaction.followUp({
                content: "Internal server error",
                ephemeral: true,
            });
            return;
        }
        await interaction.followUp({
            embeds: [(0, user_embed_1.userEmbed)(minecraftAccount, user)],
            ephemeral: true,
        });
    },
};
