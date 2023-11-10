import { ButtonInteraction, messageLink } from "discord.js";
import { MinecraftApplication } from "./application";
import { logger } from "@logger";
import { config } from "@config";
import { MinecraftApplicationWhitelistMessageOptions } from "@views/application/minecraft-application-whitelist-message";
import { MinecraftApplicationEvent } from "@views/application/minecraft-application-start-message";
import { MinecraftApplicationDecisionEvent } from "@views/application/minecraft-application-decision-message";

export const handleMinecraftApplicationDecisionMessageAcceptButtonPress =
  async (interaction: ButtonInteraction) => {
    const channel = interaction.client.channels.cache.get(
      config.WHITELIST_NOTIFICATIONS_CHANNEL_ID
    );
    if (!channel?.isTextBased()) {
      logger.discord(
        "error",
        "WHITELIST_NOTIFICATIONS_CHANNEL IS NOT A TEXT BASED CHANNEL!!!"
      );
      return;
    }

    if(interaction.customId != MinecraftApplicationDecisionEvent.Accept) return;

    let application: MinecraftApplication | undefined;

    try {
      application =
        MinecraftApplication.fromMinecraftApplicationDecisionMessage(
          interaction.message
        );
    } catch (error) {
      logger.discord(
        "error",
        "failed to parse decision message " +
          messageLink(interaction.channelId, interaction.message.id)
      );
    }

    if (!application) return;

    const opts = MinecraftApplicationWhitelistMessageOptions(application);
    channel
      .send(MinecraftApplicationWhitelistMessageOptions(application))
      .catch(() => null);
    const dmChannel = await interaction.client.users
      .createDM(application.discordId)
      .catch(() => undefined);
    if (!dmChannel) return;

    dmChannel.send(opts).catch(() => {
      logger.discord(
        "error",
        "could not open dm channel for user " + application?.discordId
      );
    });

    await interaction.reply({
      ephemeral: true,
      content: "Accepted application" + messageLink(interaction.channelId, interaction.message.id)
    });

    await interaction.message.edit({
      components: []
    });
  };
