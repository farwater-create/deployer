/* eslint-disable unicorn/no-await-expression-member */
import { Client, Events, TextChannel } from "discord.js";
import { config } from "../lib/config";
import logger from "../lib/logger";
import prisma from "../lib/prisma";
import { adminApplicationLogEmbed } from "../templates/admin-application-log-embed";
import { handleAccept } from "./application-decision-listener/handle-accept";
import { handleReject } from "./application-decision-listener/handle-reject";

export default (client: Client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    const logChannel =
      (interaction.client.channels.cache.get(
        config.APPLICATION_LOG_CHANNEL
      ) as TextChannel) ||
      ((await interaction.client.channels.fetch(
        config.APPLICATION_LOG_CHANNEL
      )) as TextChannel);
    // Accept Handler
    if (
      interaction.isButton() &&
      interaction.customId.startsWith("create-application-accept:")
    ) {
      try {
        const application = await prisma.whitelistApplication.findUnique({
          where: {
            id: interaction.customId.split(":")[1],
          },
        });
        if (!application) {
          await interaction.reply("User has left the server...");
          return;
        }
        handleAccept(application, interaction);
        const user =
          client.users.cache.get(application.discordID) ||
          (await client.users.fetch(application.discordID));
        await prisma.whitelistApplication.delete({
          where: {
            id: application.id,
          },
        });
        await logChannel.send({
          embeds: [
            adminApplicationLogEmbed(
              application,
              user,
              interaction.user,
              "accepted"
            ),
          ],
        });
        await interaction.message.delete();
      } catch (error) {
        logger.error(error);
        return;
      }
    }

    // Reject Handler
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId.startsWith("create-application-reject:")
    ) {
      try {
        const application = await prisma.whitelistApplication.findUnique({
          where: {
            id: interaction.customId.split(":")[1],
          },
        });
        if (!application) return;
        const user =
          interaction.client.users.cache.get(application.discordID) ||
          (await interaction.client.users.fetch(application.discordID));
        if (!user) return;
        const reason = interaction.values[0];
        await prisma.whitelistApplication.delete({
          where: {
            id: application.id,
          },
        });
        await interaction.message.delete();
        await logChannel.send({
          embeds: [
            adminApplicationLogEmbed(
              application,
              user,
              interaction.user,
              "rejected",
              interaction.values[0]
            ),
          ],
        });
        await handleReject(user, reason, interaction);
      } catch (error) {
        logger.error(error);
      }
    }
  });
};
