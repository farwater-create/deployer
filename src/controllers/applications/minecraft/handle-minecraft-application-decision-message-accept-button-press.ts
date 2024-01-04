import {config} from "@config";
import {logger} from "@logger";
import {MinecraftApplicationCustomId} from "@models/application/application";
import {MinecraftApplicationWhitelistMessageOptions} from "@views/application/minecraft-application-whitelist-message";
import {ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, messageLink} from "discord.js";
import {MinecraftApplication} from "./application";

export const handleMinecraftApplicationDecisionMessageAcceptButtonPress = async (interaction: ButtonInteraction) => {
    const channel = interaction.client.channels.cache.get(config.WHITELIST_NOTIFICATIONS_CHANNEL_ID);
    if (!channel?.isTextBased()) {
        logger.discord("error", "WHITELIST_NOTIFICATIONS_CHANNEL IS NOT A TEXT BASED CHANNEL!!!");
        return;
    }

    let application: MinecraftApplication | undefined;

    try {
        application = MinecraftApplication.fromMinecraftApplicationDecisionMessage(interaction.message);
        await application.whitelist();
    } catch (error) {
        logger.discord(
            "error",
            "failed to parse decision message " +
                messageLink(interaction.channelId, interaction.message.id) +
                "\n" +
                error,
        );
    }

    if (!application) return;

    const _a = application.serialize().catch(logger.error);
    if (!_a) return;

    const member = await application.member().catch(logger.error);

    member?.roles.add(application.getOptions().roleId).catch(() => {
        logger.discord("error", "could not grant role " + member.user.id);
    });

    const opts = MinecraftApplicationWhitelistMessageOptions(application);
    channel.send(MinecraftApplicationWhitelistMessageOptions(application)).catch(logger.error);

    await interaction.message
        .edit({
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId(MinecraftApplicationCustomId.Start)
                        .setLabel("Accepted")
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true),
                ),
            ],
        })
        .catch(logger.error);

    const dmChannel = await (await application.user()).createDM(true).catch(logger.error);
    if (!dmChannel) return;

    dmChannel
        .send(opts)
        .catch(() => {
            logger.discord("error", "could not open dm channel for user " + application?.getOptions().discordId);
        })
        .catch(logger.error);
};
