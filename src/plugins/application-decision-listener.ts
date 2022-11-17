/* eslint-disable unicorn/no-await-expression-member */
import { WhitelistApplication } from "@prisma/client";
import { Client, Events, Interaction, TextChannel, User } from "discord.js";
import { ApplicationRejectReason } from "../interfaces/application-reject-reason";
import { config } from "../lib/config";
import { fetchUsername, whitelistAccount } from "../lib/minecraft";
import prisma from "../lib/prisma";
import { adminApplicationLogEmbed } from "../templates/admin-application-log-embed";
import gettingStarted from "../templates/getting-started";
import { whitelistEmbed } from "../templates/whitelist-embed";
import whitelistError from "../templates/whitelist-error";
import whitelistErrorOffensiveName from "../templates/whitelist-error-offensive-name";
import whitelistErrorSuspended from "../templates/whitelist-error-suspended";

const ACCESS_CREATE_ROLE = "795578910221664266";

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
            const user =
              client.users.cache.get(application.discordID) ||
              (await client.users.fetch(application.discordID));
            await logChannel.send({
              embeds: [adminApplicationLogEmbed(application, user, "accepted")],
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
            const user =
              interaction.client.users.cache.get(application.discordID) ||
              (await interaction.client.users.fetch(application.discordID));
            if (!user) return;
            const reason = interaction.values[0];
            await handleReject(user, reason);
            await logChannel.send({
              embeds: [
                adminApplicationLogEmbed(
                  application,
                  user,
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

const handleReject = async (user: User, reason: string) => {
  switch (reason) {
    case ApplicationRejectReason.Underage: {
      await (
        await user.createDM(true)
      ).send(
        "Your create application was denied for breaking discord terms of service. You must be at least thirteen years old."
      );
      break;
    }
    case ApplicationRejectReason.NoReasonProvided: {
      await (
        await user.createDM(true)
      ).send(
        "Your create application was denied for not providing a reason. Please try again."
      );
      break;
    }
    case ApplicationRejectReason.OffensiveName: {
      await (await user.createDM(true)).send(whitelistErrorOffensiveName);
      break;
    }
    case ApplicationRejectReason.BadReason: {
      {
        await (await user.createDM(true)).send("Your application was denied.");
      }
      break;
    }
    case ApplicationRejectReason.Suspended: {
      await (await user.createDM(true)).send(whitelistErrorSuspended);
      break;
    }
  }
  await prisma.whitelistApplication.deleteMany({
    where: {
      discordID: user.id,
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
  const accessCreateRole = await interaction.guild?.roles.fetch(
    ACCESS_CREATE_ROLE
  );
  const member = interaction.guild?.members.cache.get(application.discordID);
  if (!member || !accessCreateRole) {
    console.error("could not find member or role for application!");
    return;
  }
  try {
    await interaction.guild?.members.addRole({
      user: member,
      role: accessCreateRole,
      reason: "application accepted",
    });
    await DMChannel.send(gettingStarted);
    await whitelistAccount({ uuid: profile.id, name: profile.name });
    await DMChannel.send({
      embeds: [whitelistEmbed(profile)],
    });
  } catch (error) {
    console.error(error);
    await DMChannel.send(whitelistError);
    return;
  }
};
