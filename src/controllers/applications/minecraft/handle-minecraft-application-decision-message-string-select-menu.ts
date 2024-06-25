import { config } from "@config";
import { FarwaterUser } from "@controllers/users/farwater-user";
import { logger } from "@logger";
import { MinecraftApplicationReviewStatus } from "@models/application/application";
import { MinecraftApplicationRejectReason, minecraftApplicationRejectReasons } from "@models/application/reject-reasons";
import { MinecraftApplicationDecisionMessageOptions } from "@views/application/minecraft-application-decision-message";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageEditOptions,
    StringSelectMenuInteraction,
} from "discord.js";
import { MinecraftApplication } from "./application";

export const handleMinecraftApplicationDecisionMessageStringSelectMenu = async (
    interaction: StringSelectMenuInteraction,
) => {
    const value = interaction.values[0] as MinecraftApplicationRejectReason;
    let application: MinecraftApplication | undefined;
    let farwaterUser: FarwaterUser | undefined;

    try {
        application = MinecraftApplication.fromMinecraftApplicationDecisionMessage(interaction.message);
        farwaterUser = await application.getFarwaterUser();
    } catch (error) {
        logger.error(error);
        return;
    }
    if (!application) return;
    if (!farwaterUser) return;

    await application.updateStatus(MinecraftApplicationReviewStatus.Rejected);

    const { discordId } = application.getOptions();
    const guild = interaction.client.guilds.cache.get(config.GUILD_ID);
    if (!guild) {
        throw new Error("guild not found");
    }
    const rejectReasonDescription = minecraftApplicationRejectReasons[value];
    const user = await interaction.client.users.fetch(discordId);
    if (!user) return;
    const dmChannel = await user.createDM(true);

    try {
        const reply = `Your application for Farwater has been **declined** for the following reason: \`${rejectReasonDescription}\`.`;
        let footnotes: string | undefined;
        switch (value) {
            case "otherBannable":
                break;
            case "underage":
                break;
            case "noMinecraftAccount":
                footnotes = "Double check your Minecraft name (case sensitive) and apply again.";
                break;
            case "offensiveDiscordUser":
                footnotes = "If you still wish to join our community, please change your name and re-apply.";
                break;
            case "offensiveMinecraftSkin":
                await application.getFarwaterUser().then((a) => a?.flagOffensiveSkin());
                footnotes = "If you still wish to join our community, please change your skin and re-apply.";
                break;
            case "userLeftDiscordServer":
                break;
            case "invalidAge":
                footnotes = "Please enter a valid age when re-applying.";
                break;
            default:
                break;
        }
        await dmChannel.send(`${reply}\n${footnotes || ""}`);
    } catch (error) {
        logger.discord("warn", "Tried to send dm to user <@" + user.id + "> but user has dms closed.");
    }

    const messageEditOptions = MinecraftApplicationDecisionMessageOptions(
        application.getOptions(),
        farwaterUser.getOptions(),
        {
            status: MinecraftApplicationReviewStatus.Rejected,
            reason: value,
        },
        interaction.user,
    ) as MessageEditOptions;

    const message = await interaction.message
        .edit({
            ...messageEditOptions,
        })
        .catch((err) => logger.error(err));
    if (!message) return;
};
