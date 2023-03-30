import { WhitelistApplication } from "@prisma/client";
import { Interaction, TextChannel } from "discord.js";
import { config } from "../../lib/config";
import logger from "../../lib/logger";
import { fetchUsername, whitelistAccount } from "../../lib/minecraft";
import prisma from "../../lib/prisma";
import { ACCESS_CREATE_ROLE } from "../../lib/roles";
import gettingStarted from "../../templates/getting-started";
import { whitelistEmbed } from "../../templates/whitelist-embed";

export const handleAccept = async (
  application: WhitelistApplication,
  interaction: Interaction
) => {
  if (!interaction.guild) return;
  if (!interaction.member) return;
  const role = interaction.guild.roles.resolve(ACCESS_CREATE_ROLE);
  if (!role) throw new Error("role " + role + " not found");
  // add role
  try {
    await interaction.guild.members.addRole({
      user: interaction.user,
      role,
      reason: "application accepted",
    });
  } catch (error) {
    logger.error(error);
  }

  // whitelist account
  try {
    const account = await fetchUsername(application.minecraftUUID);
    await whitelistAccount({
      name: account.name,
      uuid: account.id,
    });
  } catch (error) {
    logger.error(error);
  }

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
  } catch (error) {
    logger.error(error);
  }

  // fetch user info
  let user = interaction.client.users.cache.get(application.discordID);
  if (!user) user = await interaction.client.users.fetch(application.discordID);
  if (!user) {
    logger.error("could not fetch user " + application.discordID);
    return;
  }

  // send embeds
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
  embed.setDescription(`${gettingStarted}`);
  await applicationsAcceptedChannel.send({
    content: `<@${application.discordID}>`,
    embeds: [embed],
  });
  // eslint-disable-next-line unicorn/no-await-expression-member
  (await user.createDM(true)).send({
    embeds: [embed],
  });
};
