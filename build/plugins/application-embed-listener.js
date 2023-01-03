"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("../lib/config");
const logger_1 = __importDefault(require("../lib/logger"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const whitelist_application_modal_1 = require("../templates/whitelist-application-modal");
exports.default = async (client) => {
    const channel = client.channels.cache.get(config_1.config.APPLICATIONS_CHANNEL) ||
        (await client.channels.fetch(config_1.config.APPLICATIONS_CHANNEL));
    if (!channel) {
        throw new Error("channel not found: " + config_1.config.APPLICATIONS_CHANNEL);
    }
    if (!channel.isTextBased()) {
        throw new Error("invalid applications channel: " + config_1.config.APPLICATIONS_CHANNEL);
    }
    const messages = await channel.messages.fetch({ limit: 1 });
    const message = messages.first();
    const isMessageEmbed = message?.author.bot && message.author.id === client.user?.id;
    if (!isMessageEmbed) {
        logger_1.default.info("recreating applications embed");
        channel.send({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setTitle("Farwater Create Applications")
                    .setDescription('Please read the rules @ <#1020403465643638894> Click "Apply" to apply.')
                    .setThumbnail("https://gitea.kamaii.xyz/humbertovnavarro/season-7-modpack/raw/branch/main/overrides/background.png"),
            ],
            components: [
                new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId("create-application-apply")
                    .setLabel("Apply")
                    .setStyle(discord_js_1.ButtonStyle.Primary)),
            ],
        });
    }
    else {
        logger_1.default.error("last message is from bot, assuming it exists");
    }
    client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
        if (interaction.isButton() &&
            interaction.customId.startsWith("create-application-apply")) {
            const application = await prisma_1.default.whitelistApplication.findFirst({
                where: {
                    discordID: interaction.user.id,
                },
            });
            if (application) {
                await interaction.reply({
                    content: "You've already submitted an application",
                    ephemeral: true,
                });
                return;
            }
            await interaction.showModal(whitelist_application_modal_1.WhitelistApplicationModal);
        }
    });
};
