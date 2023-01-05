"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../lib/prisma"));
const discord_js_1 = require("discord.js");
const admin_application_log_embed_1 = require("../../templates/admin-application-log-embed");
const config_1 = require("../../lib/config");
const handle_accept_1 = require("./handle-accept");
const logger_1 = __importDefault(require("../../lib/logger"));
exports.default = (client) => {
    client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
        const logChannel = interaction.client.channels.cache.get(config_1.config.APPLICATION_LOG_CHANNEL) ||
            (await interaction.client.channels.fetch(config_1.config.APPLICATION_LOG_CHANNEL));
        // Accept Handler
        if (interaction.isButton() &&
            interaction.customId.startsWith("create-application-accept:")) {
            const application = await prisma_1.default.whitelistApplication.findUnique({
                where: {
                    id: interaction.customId.split(":")[1],
                },
            });
            if (!application) {
                await interaction.reply("User has left the server...");
                return;
            }
            try {
                (0, handle_accept_1.handleAccept)(application, interaction);
            }
            catch (error) {
                logger_1.default.error(error);
            }
            const user = client.users.cache.get(application.discordID) ||
                (await client.users.fetch(application.discordID));
            await logChannel.send({
                embeds: [
                    (0, admin_application_log_embed_1.adminApplicationLogEmbed)(application, user, interaction.user, "accepted"),
                ],
            });
            await interaction.message.delete();
        }
        // Reject Handler
        if (interaction.isStringSelectMenu() &&
            interaction.customId.startsWith("create-application-reject:")) {
            const application = await prisma_1.default.whitelistApplication.findUnique({
                where: {
                    id: interaction.customId.split(":")[1],
                },
            });
            if (!application)
                return;
            const user = interaction.client.users.cache.get(application.discordID) ||
                (await interaction.client.users.fetch(application.discordID));
            if (!user)
                return;
            const reason = interaction.values[0];
            await prisma_1.default.whitelistApplication.delete({
                where: {
                    id: application.id,
                },
            });
            await interaction.message.delete();
            await logChannel.send({
                embeds: [
                    (0, admin_application_log_embed_1.adminApplicationLogEmbed)(application, user, interaction.user, "rejected", interaction.values[0]),
                ],
            });
            try {
                await handleReject(user, reason, interaction);
            }
            catch (error) {
                logger_1.default.error(error);
            }
        }
    });
};
