/* eslint-disable unicorn/no-await-expression-member */
import { WhitelistApplication } from "@prisma/client";
import { Client, Events, Interaction, TextChannel, User } from "discord.js";
import { ApplicationRejectReason } from "../interfaces/application-reject-reason";
import { config } from "../lib/config";
import logger from "../lib/logger";
import { fetchUsername, whitelistAccount } from "../lib/minecraft";
import prisma from "../lib/prisma";
import { adminApplicationLogEmbed } from "../templates/admin-application-log-embed";
import gettingStarted from "../templates/getting-started";
import { whitelistEmbed } from "../templates/whitelist-embed";
import whitelistErrorOffensiveName from "../templates/whitelist-error-offensive-name";

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
        if (!application) {
          await interaction.reply("User has left the server...");
          return;
        }
        try {
          handleAccept(application, interaction);
          const user =
            client.users.cache.get(application.discordID) ||
            (await client.users.fetch(application.discordID));
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
          await interaction.message.delete();
          await prisma.whitelistApplication.delete({
            where: {
              id: application.id,
            },
          });
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
        if (!application) return;
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
                interaction.user,
                "rejected",
                interaction.values[0]
              ),
            ],
          });
          await interaction.message.delete();
        } catch (error) {
          logger.error(error);
          await prisma.whitelistApplication.delete({
            where: {
              id: application.id,
            },
          });
        }
      }
    } catch (error) {
      await logChannel.send(`${JSON.stringify(error, undefined, 2)}`);
    }
  });
};

const handleReject = async (user: User, reason: string) => {
  const whitelistChannel =
    user.client.channels.cache.get(config.APPLICATIONS_ACCEPTED_CHANNEL) ||
    ((await user.client.channels.fetch(
      config.APPLICATIONS_ACCEPTED_CHANNEL
    )) as TextChannel);
  if (!whitelistChannel || !whitelistChannel.isTextBased()) {
    logger.error("whitelist channel not found");
    return;
  }
  switch (reason) {
    case ApplicationRejectReason.Underage: {
      await whitelistChannel.send(
        `<@${user.id}> Your create application was denied for breaking discord terms of service. You must be at least thirteen years old.`
      );
      break;
    }
    case ApplicationRejectReason.NoReasonProvided: {
      await whitelistChannel.send(
        `<@${user.id}> Your create application was denied for not providing a valid reason. Please try again.`
      );
      break;
    }
    case ApplicationRejectReason.OffensiveName: {
      await whitelistChannel.send(whitelistErrorOffensiveName);
      break;
    }
    case ApplicationRejectReason.BadAccount: {
      await whitelistChannel.send(`<@${user.id}> Your application was denied.`);
      break;
    }
    case ApplicationRejectReason.BadReason: {
      await whitelistChannel.send(`<@${user.id}> Your application was denied.`);
      break;
    }
    case ApplicationRejectReason.Suspended: {
      await whitelistChannel.send(`<@${user.id}> Your application was denied because applications are suspended.
        Please try again at a later date. Check the announcements channel for more information.`);
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
  // update database
  try {
    await prisma.whitelistApplication.update({
      where: {
        id: application.id,
      },
      data: {
        status: "accepted",
      },
    });
    const account = await fetchUsername(application.minecraftUUID);
    await whitelistAccount({
      name: account.name,
      uuid: account.id,
    });
  } catch (error) {
    logger.error(error);
  }

  // fetch role
  const accessCreateRole = await interaction.guild?.roles.fetch(
    ACCESS_CREATE_ROLE
  );

  if (!accessCreateRole) {
    logger.error("create role not found");
    return;
  }

  // fetch user info
  let user = interaction.client.users.cache.get(application.discordID);
  if (!user) user = await interaction.client.users.fetch(application.discordID);
  if (!user) {
    logger.error("could not fetch user " + application.discordID);
    return;
  }

  const member = interaction.guild?.members.cache.get(application.discordID);
  if (!member) return;

  // add create role
  try {
    await interaction.guild?.members.addRole({
      user: member,
      role: accessCreateRole,
      reason: "application accepted",
    });
  } catch (error) {
    logger.error(error);
    return;
  }

  try {
    const profile = await fetchUsername(application.minecraftUUID);
    const applicationsAcceptedChannel =
      interaction.client.channels.cache.get(
        config.APPLICATIONS_ACCEPTED_CHANNEL
      ) ||
      ((await interaction.client.channels.fetch(
        config.APPLICATIONS_ACCEPTED_CHANNEL
      )) as TextChannel);
    if (
      !applicationsAcceptedChannel ||
      !applicationsAcceptedChannel.isTextBased()
    ) {
      logger.error("applications channel not found");
      return;
    }
    const embed = whitelistEmbed(profile);
    embed.setDescription(`${gettingStarted}\n<@${application.discordID}>`);
    await applicationsAcceptedChannel.send({
      embeds: [embed],
    });
    (await user.createDM(true)).send({
      embeds: [embed],
    });
  } catch (error) {
    logger.error(error);
  }
};
