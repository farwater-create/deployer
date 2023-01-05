"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userEmbed = void 0;
const discord_js_1 = require("discord.js");
function userEmbed(minecraftUser, user) {
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle(`${user.username}'s Create Profile`)
        .addFields([
        {
            name: "minecraft",
            value: minecraftUser.name,
            inline: false,
        },
        {
            name: "minecraft_uuid",
            value: minecraftUser.id,
            inline: false,
        },
        {
            name: "discord",
            value: `<@${user.id}>`,
            inline: false,
        },
        {
            name: "discord_id",
            value: user.id,
            inline: false,
        },
    ])
        .setThumbnail(user.avatarURL() ||
        `https://crafatar.com/renders/head/${minecraftUser.id}`)
        .setImage(`https://mc-heads.net/body/${minecraftUser.id}.png`);
    return embed;
}
exports.userEmbed = userEmbed;
