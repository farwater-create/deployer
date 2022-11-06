/* eslint-disable unicorn/no-await-expression-member */
import { WhitelistApplication } from "@prisma/client";
import {
  Client,
  Events,
  Interaction,
  SelectMenuInteraction,
  TextChannel,
} from "discord.js";
import { ApplicationRejectReason } from "../interfaces/application-reject-reason";
import { config } from "../lib/config";
import { fetchUsername, whitelistAccount } from "../lib/minecraft";
import prisma from "../lib/prisma";
import { adminApplicationLogEmbed } from "../templates/admin-application-log-embed";
import { whitelistEmbed } from "../templates/whitelist-embed";

export default (client: Client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    const logChannel =
      (interaction.client.channels.cache.get(
        config.APPLICATION_LOG_CHANNEL
      ) as TextChannel) ||
      ((await interaction.client.channels.fetch(
        config.APPLICATION_LOG_CHANNEL
      )) as TextChannel);
    try {
      // Accept Handler
      if (
        interaction.isButton() &&
        interaction.customId.startsWith("create-application-accept:")
      ) {
        const application = await prisma.whitelistApplication.findUnique({
          where: {
            id: interaction.customId.split(":")[1],
          },
        });
        if (application) {
          try {
            handleAccept(application, interaction);
            await logChannel.send({
              embeds: [
                adminApplicationLogEmbed(
                  application,
                  interaction.user,
                  "accepted"
                ),
              ],
            });
            await interaction.message.delete();
          } catch (error) {
            console.error(error);
            await interaction.message.delete();
            await prisma.whitelistApplication.delete({
              where: {
                id: application.id,
              },
            });
          }
        } else {
          await interaction.channel?.send("Application id not found!");
          await interaction.message.delete();
        }
      }

      // Reject Handler
      if (
        interaction.isSelectMenu() &&
        interaction.customId.startsWith("create-application-reject:")
      ) {
        const application = await prisma.whitelistApplication.findUnique({
          where: {
            id: interaction.customId.split(":")[1],
          },
        });
        if (application) {
          try {
            handleReject(application, interaction);
            await logChannel.send({
              embeds: [
                adminApplicationLogEmbed(
                  application,
                  interaction.user,
                  "rejected",
                  interaction.values[0]
                ),
              ],
            });
            await interaction.message.delete();
          } catch (error) {
            console.error(error);
            await prisma.whitelistApplication.delete({
              where: {
                id: application.id,
              },
            });
          }
        } else {
          await interaction.channel?.send("Application id not found!");
          await interaction.message.delete();
        }
      }
    } catch (error) {
      await logChannel.send(`${JSON.stringify(error, undefined, 2)}`);
    }
  });
};

const handleReject = async (
  application: WhitelistApplication,
  interaction: SelectMenuInteraction
) => {
  const reason = interaction.values[0];
  switch (reason) {
    case ApplicationRejectReason.Underage: {
      await (
        await interaction.user.createDM(true)
      ).send(
        "Your create application was denied for breaking discord terms of service. You must be at least thirteen years old."
      );
      break;
    }
    case ApplicationRejectReason.NoReasonProvided: {
      await (
        await interaction.user.createDM(true)
      ).send(
        "Your create application was denied for not providing a reason. Please try again."
      );
      break;
    }
    case ApplicationRejectReason.OffensiveName: {
      await (
        await interaction.user.createDM(true)
      ).send(
        "Your create application was denied for having an offensive name. Please change your name, rejoin and try again."
      );
      break;
    }
    case ApplicationRejectReason.BadReason: {
      {
        await (
          await interaction.user.createDM(true)
        ).send("Your application was denied.");
      }
      break;
    }
    case ApplicationRejectReason.Suspended: {
      await (
        await interaction.user.createDM(true)
      ).send(
        "Your application was denied because applications are suspended. Please try again at a later date. Check the announcements channel for more information."
      );
      break;
    }
  }
  await prisma.whitelistApplication.deleteMany({
    where: {
      discordID: interaction.user.id,
    },
  });
};

const handleAccept = async (
  application: WhitelistApplication,
  interaction: Interaction
) => {
  await prisma.whitelistApplication.update({
    where: {
      id: application.id,
    },
    data: {
      status: "accepted",
    },
  });
  let user = interaction.client.users.cache.get(application.discordID);
  if (!user) user = await interaction.client.users.fetch(application.discordID);
  if (!user) {
    console.error("could not fetch user " + application.discordID);
    return;
  }
  const DMChannel = await user.createDM(true);
  const profile = await fetchUsername(application.minecraftUUID);
  await whitelistAccount(profile.name);
  DMChannel.send("Your application was approved. Welcome to farwater!");
  DMChannel.send({
    embeds: [whitelistEmbed(profile)],
  });
};
