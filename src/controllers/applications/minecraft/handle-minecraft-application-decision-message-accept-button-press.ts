import { config } from "@config";
import { logger } from "@logger";
import { MinecraftApplicationReviewStatus } from "@models/application/application";
import { ButtonInteraction, MessageEditOptions, TextBasedChannel } from "discord.js";
import { MinecraftApplication } from "./application";
import { MinecraftApplicationWhitelistMessageOptions } from "@views/application/minecraft-application-whitelist-message";
import { MinecraftApplicationDecisionMessageOptions } from "@views/application/minecraft-application-decision-message";

export const handleMinecraftApplicationDecisionMessageAcceptButtonPress = async (interaction: ButtonInteraction) => {
    await interaction.deferUpdate();

    const channel = interaction.client.channels.cache.get(config.WHITELIST_NOTIFICATIONS_CHANNEL_ID) as TextBasedChannel;
    if (!channel?.isTextBased()) {
        logger.discord("error", "WHITELIST_NOTIFICATIONS_CHANNEL is not a text-based channel!");
        return;
    }

    try {
        const application = MinecraftApplication.fromMinecraftApplicationDecisionMessage(interaction.message);
        const farwaterUser = await application.getFarwaterUser();

        if (!farwaterUser) {
            logger.discord("error", `No user found for ${application.getOptions().serverId} + ${application.getOptions().discordId}.`);
            return;
        }

        await farwaterUser.whitelist(application.getOptions().serverId);
        await application.updateStatus(MinecraftApplicationReviewStatus.Accepted);

        const member = await farwaterUser.member().catch(err => logger.error(err));

        await member?.roles.add(application.getOptions().roleId).catch(err => {
            logger.discord("error", "Could not grant role: " + err.message);
        });

        const messageOpts = await MinecraftApplicationWhitelistMessageOptions(application);
        await channel.send(messageOpts).catch(err => logger.error(err));

        const editOptions: MessageEditOptions = MinecraftApplicationDecisionMessageOptions(application.getOptions(), farwaterUser.getOptions(), {
            status: MinecraftApplicationReviewStatus.Accepted,
            reason: "accepted"
        }, interaction.user);

        await interaction.message.edit(editOptions).catch(err => logger.error(err));

        const dmChannel = await farwaterUser.user().then(user => user.createDM()).catch(err => logger.error(err));
        if (!dmChannel) return;

        await dmChannel.send(messageOpts).catch(err => {
            logger.discord("error", "Could not send DM: " + err.message);
        });
    } catch (error) {
        logger.discord("error", "Failed to handle application decision: " + error);
    }
};
