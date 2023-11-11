import { ButtonInteraction, messageLink } from "discord.js";
import { MinecraftApplication } from "./application";
import { logger } from "@logger";
import { config } from "@config";
import { MinecraftApplicationWhitelistMessageOptions } from "@views/application/minecraft-application-whitelist-message";
import { MinecraftApplicationEvent } from "@views/application/minecraft-application-start-message";
import { MinecraftApplicationDecisionEvent } from "@views/application/minecraft-application-decision-message";
import { prisma } from "@lib/prisma";
import { PterodactylPanel } from "@controllers/pterodactyl/pterodactyl";

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

    const _a = application?.serialize(prisma).catch(logger.error);
    if(!_a) return;

    const opts = MinecraftApplicationWhitelistMessageOptions(application);
    channel
      .send(MinecraftApplicationWhitelistMessageOptions(application))
      .catch(logger.error);

    await interaction.reply({
      ephemeral: true,
      content: "Accepted application" + messageLink(interaction.channelId, interaction.message.id)
    }).catch(err => logger.error(err));

    await interaction.message.edit({
      components: []
    }).catch(logger.error)

    const dmChannel = await interaction.client.users
      .createDM(application.discordId)
      .catch(logger.error);
    if (!dmChannel) return;

    dmChannel.send(opts).catch(() => {
      logger.discord(
        "error",
        "could not open dm channel for user " + application?.discordId
      );
    }).catch(logger.error);

    PterodactylPanel.minecraft(config.PTERODACTYL_SERVER_ID).whitelist(application.minecraftName).catch(err => logger.discord("error", err));
  };
