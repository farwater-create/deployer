import {config} from "@config";
import {FarwaterUser} from "@controllers/users/farwater-user";
import {logger} from "@logger";
import {MinecraftApplicationCustomId, MinecraftApplicationReviewStatus} from "@models/application/application";
import {MinecraftApplicationWhitelistMessageOptions} from "@views/application/minecraft-application-whitelist-message";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Colors,
    EmbedBuilder,
    messageLink,
} from "discord.js";
import {MinecraftApplication} from "./application";

export const handleMinecraftApplicationDecisionMessageAcceptButtonPress = async (interaction: ButtonInteraction) => {
    interaction.deferUpdate();

    const channel = interaction.client.channels.cache.get(config.WHITELIST_NOTIFICATIONS_CHANNEL_ID);
    if (!channel?.isTextBased()) {
        logger.discord("error", "WHITELIST_NOTIFICATIONS_CHANNEL IS NOT A TEXT BASED CHANNEL!!!");
        return;
    }

    let application: MinecraftApplication | undefined;
    let farwaterUser: FarwaterUser | undefined;

    try {
        application = MinecraftApplication.fromMinecraftApplicationDecisionMessage(interaction.message);
        farwaterUser = await application.getFarwaterUser();
        if (farwaterUser) {
            await farwaterUser.whitelist(application.getOptions().serverId);
        }
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
    if (!farwaterUser) return;

    await application.updateStatus(MinecraftApplicationReviewStatus.Accepted);

    const member = await farwaterUser.member().catch(logger.error);

    await member?.roles.add(application.getOptions().roleId).catch(() => {
        logger.discord("error", "could not grant role " + member.user.id);
    });

    const opts = MinecraftApplicationWhitelistMessageOptions(application);
    channel.send(await MinecraftApplicationWhitelistMessageOptions(application)).catch(logger.error);

    await interaction.message
        .edit({
            embeds: interaction.message.embeds.map((embed) => new EmbedBuilder(embed.data).setColor(Colors.Green)),
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

    const dmChannel = await (await farwaterUser.user()).createDM(true).catch(logger.error);
    if (!dmChannel) return;

    dmChannel
        .send(await opts)
        .catch(() => {
            logger.discord("error", "could not open dm channel for user " + application?.getOptions().discordId);
        })
        .catch(logger.error);
};
