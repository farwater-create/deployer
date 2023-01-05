"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable unicorn/no-await-expression-member */
const discord_js_1 = require("discord.js");
const config_1 = require("../lib/config");
const logger_1 = __importDefault(require("../lib/logger"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const admin_application_log_embed_1 = require("../templates/admin-application-log-embed");
const handle_accept_1 = require("./application-decision-listener/handle-accept");
const handle_reject_1 = require("./application-decision-listener/handle-reject");
exports.default = (client) => {
    client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
        const logChannel = interaction.client.channels.cache.get(config_1.config.APPLICATION_LOG_CHANNEL) ||
            (await interaction.client.channels.fetch(config_1.config.APPLICATION_LOG_CHANNEL));
        // Accept Handler
        if (interaction.isButton() &&
            interaction.customId.startsWith("create-application-accept:")) {
            try {
                const application = await prisma_1.default.whitelistApplication.findUnique({
                    where: {
                        id: interaction.customId.split(":")[1],
                    },
                });
                if (!application) {
                    await interaction.reply("User has left the server...");
                    return;
                }
                (0, handle_accept_1.handleAccept)(application, interaction);
                const user = client.users.cache.get(application.discordID) ||
                    (await client.users.fetch(application.discordID));
                await prisma_1.default.whitelistApplication.delete({
                    where: {
                        id: application.id,
                    },
                });
                await logChannel.send({
                    embeds: [
                        (0, admin_application_log_embed_1.adminApplicationLogEmbed)(application, user, interaction.user, "accepted"),
                    ],
                });
                await interaction.message.delete();
            }
            catch (error) {
                logger_1.default.error(error);
                return;
            }
        }
        // Reject Handler
        if (interaction.isStringSelectMenu() &&
            interaction.customId.startsWith("create-application-reject:")) {
            try {
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
                await (0, handle_reject_1.handleReject)(user, reason, interaction);
            }
            catch (error) {
                logger_1.default.error(error);
            }
        }
    });
};
