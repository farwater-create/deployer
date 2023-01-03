"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whitelistEmbed = void 0;
const discord_js_1 = require("discord.js");
const whitelistEmbed = (profile) => {
    return new discord_js_1.EmbedBuilder()
        .setTitle("Whitelisted")
        .setThumbnail(`https://mc-heads.net/avatar/${profile.id}.png`)
        .addFields([
        {
            name: "uuid",
            value: profile.id,
            inline: false,
        },
        {
            name: "account name",
            value: profile.name,
            inline: false,
        },
    ])
        .setImage(`https://mc-heads.net/body/${profile.id}.png`);
};
exports.whitelistEmbed = whitelistEmbed;
