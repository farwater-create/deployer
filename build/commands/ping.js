"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ping = void 0;
const discord_js_1 = require("discord.js");
exports.ping = {
    json: new discord_js_1.SlashCommandBuilder()
        .setName("ping")
        .setDescription("responds with pong")
        .toJSON(),
    handler: function (interaction) {
        interaction.reply("pong");
    },
};
