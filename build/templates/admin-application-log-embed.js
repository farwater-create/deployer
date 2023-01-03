"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminApplicationLogEmbed = void 0;
const discord_js_1 = require("discord.js");
function adminApplicationLogEmbed(application, user, reviewer, status, reason) {
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle(`${user.username}'s Create Application`)
        .addFields([
        {
            name: "age",
            value: `${application.age}`,
        },
        {
            name: "reason",
            value: `${application.reason}`,
        },
        {
            name: "application_id",
            value: application.id,
        },
        {
            name: "minecraft_uuid",
            value: application.minecraftUUID,
            inline: false,
        },
        {
            name: "discord",
            value: `<@${user.id}>`,
            inline: false,
        },
        {
            name: "discord_id",
            value: application.discordID,
            inline: false,
        },
        {
            name: "status",
            value: status,
            inline: false,
        },
        {
            name: "reviewer",
            value: `<@${reviewer.id}>`,
        },
    ])
        .setThumbnail(user.displayAvatarURL() || user.defaultAvatarURL);
    switch (status) {
        case "accepted": {
            embed.setColor(discord_js_1.Colors.Green);
            break;
        }
        case "rejected": {
            embed.setColor(discord_js_1.Colors.Red);
            break;
        }
    }
    if (reason) {
        embed.addFields([
            {
                name: "denied for",
                value: `${reason}`,
            },
        ]);
    }
    return embed;
}
exports.adminApplicationLogEmbed = adminApplicationLogEmbed;
