import {
    MinecraftApplicationCustomId,
    MinecraftApplicationModel,
    MinecraftApplicationReviewStatus,
    MinecraftAutoReviewResult,
} from "@models/application/application";
import {minecraftApplicationRejectReasons} from "@models/application/reject-reasons";
import {FarwaterUserModel} from "@models/user/farwater-user";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ColorResolvable,
    Colors,
    EmbedBuilder,
    MessageCreateOptions,
    StringSelectMenuBuilder,
    User,
} from "discord.js";

const MinecraftApplicationDecisionEmbed = (
    minecraftApplication: MinecraftApplicationModel,
    farwaterUser: FarwaterUserModel,
    autoReviewResult: MinecraftAutoReviewResult,
    reviewer?: User,
) => {
    const {reason, discordId, serverId, roleId} = minecraftApplication;
    let color: ColorResolvable = Colors.Blue;

    switch (autoReviewResult.status) {
        case MinecraftApplicationReviewStatus.Accepted:
            color = Colors.Green;
            break;
        case MinecraftApplicationReviewStatus.Rejected:
            color = Colors.Red;
            break;
        case MinecraftApplicationReviewStatus.NeedsManualReview:
            color = Colors.Yellow;
            break;
    }

    const embed = new EmbedBuilder()
        .setTitle("Whitelist Application")
        .setDescription(reason)
        .addFields([
            {
                name: "discordId",
                value: discordId || "null",
            },
            {
                name: "discord",
                value: `<@${discordId}>`,
            },
            {
                name: "age",
                value: farwaterUser.age || "null",
            },
            {
                name: "minecraftName",
                value: farwaterUser.minecraftName || "null",
            },
            {
                name: "minecraftUuid",
                value: farwaterUser.minecraftUuid || "null",
            },
            {
                name: "minecraftSkinSum",
                value: farwaterUser.minecraftSkinSum || "null",
            },
            {
                name: "autoReviewComment",
                value: autoReviewResult.reason || "null",
            },
            {
                name: "serverId",
                value: serverId || "null",
            },
            {
                name: "roleId",
                value: roleId || "null",
            },
        ])
        .setColor(color);
    const thumbnail = new URL(`https://mc-heads.net/body/${farwaterUser.minecraftName}.png`);
    const image = new URL(`https://mc-heads.net/body/${farwaterUser.minecraftName}.png`);
    embed.setImage(image.toString());
    embed.setThumbnail(thumbnail.toString());
    if (reviewer) {
        embed.addFields([
            {
                name: "reviewer",
                value: `<@${reviewer.id}>`,
            },
        ]);
    }
    return embed;
};

export const MinecraftApplicationDecisionMessageOptions = (
    application: MinecraftApplicationModel,
    farwaterUser: FarwaterUserModel,
    autoReviewResult: MinecraftAutoReviewResult,
    reviewer?: User,
) => {
    const opts: MessageCreateOptions = {
        embeds: [MinecraftApplicationDecisionEmbed(application, farwaterUser, autoReviewResult, reviewer)],
    };

    const options = Object.entries(minecraftApplicationRejectReasons).map((e) => {
        return {
            label: e[1],
            value: e[0],
        };
    });

    opts.components = [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(MinecraftApplicationCustomId.Accept)
                .setLabel("Accept")
                .setStyle(ButtonStyle.Success),
        ),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(MinecraftApplicationCustomId.Reject)
                .addOptions(options)
                .setPlaceholder("Reject with reason"),
        ),
    ];
    return opts;
};
