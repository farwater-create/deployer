"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhitelistApplicationModal = void 0;
const discord_js_1 = require("discord.js");
const modal = new discord_js_1.ModalBuilder()
    .setTitle("Create Application")
    .setCustomId("create-application");
const ageInput = new discord_js_1.TextInputBuilder()
    .setCustomId("age")
    .setMaxLength(2)
    .setMinLength(1)
    .setStyle(discord_js_1.TextInputStyle.Short)
    .setLabel("Your age.")
    .setRequired(true);
const reasonInput = new discord_js_1.TextInputBuilder()
    .setStyle(discord_js_1.TextInputStyle.Paragraph)
    .setCustomId("reason")
    .setLabel("Why do you want to join the server?")
    .setRequired(true);
const minecraftUsername = new discord_js_1.TextInputBuilder()
    .setStyle(discord_js_1.TextInputStyle.Short)
    .setCustomId("minecraft-username")
    .setLabel("Your minecraft username")
    .setRequired(true)
    .setMinLength(3)
    .setMaxLength(250);
const ageActionRow = new discord_js_1.ActionRowBuilder().addComponents(ageInput);
const reasonActionRow = new discord_js_1.ActionRowBuilder().addComponents(reasonInput);
const minecraftUsernameActionRow = new discord_js_1.ActionRowBuilder().addComponents(minecraftUsername);
modal.addComponents(ageActionRow, reasonActionRow, minecraftUsernameActionRow);
exports.WhitelistApplicationModal = modal;
