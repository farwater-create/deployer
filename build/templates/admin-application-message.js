"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminApplicationEmbedComponents = exports.adminApplicationEmbed = void 0;
const discord_js_1 = require("discord.js");
const application_reject_reason_1 = require("../interfaces/application-reject-reason");
function adminApplicationEmbed(application, user) {
    return new discord_js_1.EmbedBuilder()
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
            name: "discord_hash",
            value: `${user.username}#${user.discriminator}`,
            inline: false,
        },
        {
            name: "discord",
            value: `<@${application.discordID}>`,
            inline: false,
        },
    ])
        .setThumbnail(user.displayAvatarURL() || user.defaultAvatarURL)
        .setImage(`https://mc-heads.net/body/${application.minecraftUUID}.png`);
}
exports.adminApplicationEmbed = adminApplicationEmbed;
const adminApplicationEmbedComponents = (applicationID) => {
    return [
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`create-application-accept:${applicationID}`)
            .setLabel("Accept")
            .setStyle(discord_js_1.ButtonStyle.Success)),
        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.SelectMenuBuilder()
            .setCustomId(`create-application-reject:${applicationID}`)
            .addOptions({
            label: "underage (< 13)",
            value: application_reject_reason_1.ApplicationRejectReason.Underage,
        }, {
            label: "no reason provided",
            value: application_reject_reason_1.ApplicationRejectReason.NoReasonProvided,
        }, {
            label: "bad reason",
            value: application_reject_reason_1.ApplicationRejectReason.BadReason,
        }, {
            label: "offensive name",
            value: application_reject_reason_1.ApplicationRejectReason.OffensiveName,
        }, {
            label: "applications are suspended",
            value: application_reject_reason_1.ApplicationRejectReason.Suspended,
        })
            .setPlaceholder("Reject with reason")),
    ];
};
exports.adminApplicationEmbedComponents = adminApplicationEmbedComponents;
