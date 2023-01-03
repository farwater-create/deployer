"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("../lib/config");
const logger_1 = __importDefault(require("../lib/logger"));
const minecraft_1 = require("../lib/minecraft");
const prisma_1 = __importDefault(require("../lib/prisma"));
const admin_application_message_1 = require("../templates/admin-application-message");
exports.default = (client) => {
    client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
        if (!interaction.isModalSubmit())
            return;
        if (interaction.customId !== "create-application")
            return;
        let age;
        try {
            age = Number.parseInt(interaction.fields.getTextInputValue("age"));
            if (Number.isNaN(age)) {
                throw new TypeError("age is not a number");
            }
            if (!Number.isInteger(age)) {
                throw new TypeError("age is not an int");
            }
        }
        catch {
            await interaction.reply({
                ephemeral: true,
                content: "Age must be a valid number.",
            });
            return;
        }
        const reason = interaction.fields.getTextInputValue("reason");
        const minecraftUsername = interaction.fields.getTextInputValue("minecraft-username");
        let profile;
        try {
            profile = await (0, minecraft_1.fetchUUID)(minecraftUsername);
        }
        catch (error) {
            console.error(error);
            await interaction.reply({
                ephemeral: true,
                content: "Could not find minecraft username, please apply again.",
            });
            return;
        }
        const WhitelistApplicationData = {
            discordID: interaction.user.id,
            reason,
            age,
            minecraftUUID: profile.id,
            status: "pending",
        };
        logger_1.default.info("Recieved application: \n", JSON.stringify(WhitelistApplicationData, undefined, 2));
        const WhitelistApplication = await prisma_1.default.whitelistApplication.create({
            data: WhitelistApplicationData,
        });
        await interaction.reply({
            ephemeral: true,
            content: "Your application has been submitted",
        });
        const adminApplicationChannel = interaction.client.channels.cache.get(config_1.config.APPLICATION_PENDING_CHANNEL);
        await adminApplicationChannel.send({
            embeds: [(0, admin_application_message_1.adminApplicationEmbed)(WhitelistApplication, interaction.user)],
            components: (0, admin_application_message_1.adminApplicationEmbedComponents)(WhitelistApplication.id),
        });
    });
};
