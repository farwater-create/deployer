import {
    MinecraftApplicationCustomId,
    MinecraftApplicationModel,
    MinecraftApplicationReviewStatus,
    MinecraftAutoReviewResult,
} from "@models/application/application";
import { minecraftApplicationRejectReasons } from "@models/application/reject-reasons";
import { FarwaterUserModel } from "@models/user/farwater-user";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ColorResolvable,
    Colors,
    EmbedBuilder,
    StringSelectMenuBuilder,
    User,
} from "discord.js";

const MinecraftApplicationDecisionEmbed = (
    application: MinecraftApplicationModel,
    user: FarwaterUserModel,
    autoReview: MinecraftAutoReviewResult,
    reviewer?: User,
) => {
    let color: ColorResolvable = Colors.Blue;
    switch (autoReview.status) {
        case MinecraftApplicationReviewStatus.Accepted:
            color = Colors.Green; break;
        case MinecraftApplicationReviewStatus.Rejected:
            color = Colors.Red; break;
        case MinecraftApplicationReviewStatus.NeedsManualReview:
            color = Colors.Yellow; break;
    }

    const embed = new EmbedBuilder()
        .setTitle("Whitelist Application")
        .setColor(color)
        .addFields(Object.entries({
            minecraftUuid: user.minecraftUuid || "null",
            minecraftSkinSum: user.minecraftSkinSum || "null",
            discord: `<@${application.discordId}>`,
            discordId: application.discordId || "null",
            autoReviewComment: autoReview.reason || "null",
            serverId: application.serverId || "null",
            roleId: application.roleId || "null",
            minecraftName: user.minecraftName || "null",
            age: user.age || "null",
            reason: application.reason || "null",
        }).map(([key, value]) => ({ name: key, value })))
        .setThumbnail(`https://mc-heads.net/head/${user.minecraftName}.png`)
        .setImage(`https://mc-heads.net/body/${user.minecraftName}.png`);

    if (reviewer) {
        embed.addFields({ name: "reviewer", value: `<@${reviewer.id}>` });
    }
    return embed;
};

export const MinecraftApplicationDecisionMessageOptions = (
    application: MinecraftApplicationModel,
    user: FarwaterUserModel,
    autoReview: MinecraftAutoReviewResult,
    reviewer?: User,
) => {
    const components = [];
    switch (autoReview.status) {
        case MinecraftApplicationReviewStatus.Accepted:
            components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId(MinecraftApplicationCustomId.Accepted).setLabel("Accepted").setStyle(ButtonStyle.Success).setDisabled(true)
            ));
            break;
        case MinecraftApplicationReviewStatus.Rejected:
            components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId(MinecraftApplicationCustomId.Rejected).setLabel(`Rejected - ${autoReview.reason}`).setStyle(ButtonStyle.Danger).setDisabled(true)
            ));
            break;
        default:
            components.push(
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder().setCustomId(MinecraftApplicationCustomId.Accept).setLabel("Accept").setStyle(ButtonStyle.Success),
                ),
                new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                    new StringSelectMenuBuilder().setCustomId(MinecraftApplicationCustomId.Reject)
                        .addOptions(Object.entries(minecraftApplicationRejectReasons).map(([value, label]) => ({ label, value })))
                        .setPlaceholder("Reject with reason")
                )
            );
            break;
    }
    return { embeds: [MinecraftApplicationDecisionEmbed(application, user, autoReview, reviewer)], components };
};
