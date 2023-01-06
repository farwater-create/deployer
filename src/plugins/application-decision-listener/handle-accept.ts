import { WhitelistApplication } from "@prisma/client";
import {
  GuildMember,
  GuildMemberManager,
  Interaction,
  Role,
  TextChannel,
} from "discord.js";
import { config } from "../../lib/config";
import logger from "../../lib/logger";
import { fetchUsername, whitelistAccount } from "../../lib/minecraft";
import prisma from "../../lib/prisma";
import { ACCESS_CREATE_ROLE } from "../../lib/roles";
import gettingStarted from "../../templates/getting-started";
import { whitelistEmbed } from "../../templates/whitelist-embed";

const ADD_ROLE_ATTEMPTS = 3;

const retryAddRole = async (
  members: GuildMemberManager,
  member: GuildMember,
  role: Role
) => {
  for (let index = 0; index < ADD_ROLE_ATTEMPTS; index++) {
    try {
      await members.addRole({
        user: member,
        role,
        reason: "application accepted",
      });
      const resolvedRole = member?.roles.resolve(role);
      if (resolvedRole?.id === role.id) {
        break;
      }
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });
    } catch (error) {
      logger.error(error);
    }
    throw new Error("could not add access role after 3 attempts");
  }
};

export const handleAccept = async (
  application: WhitelistApplication,
  interaction: Interaction
) => {
  if (!interaction.guild) return;
  if (!interaction.member) return;
  // fetch role
  const accessCreateRole = await interaction.guild?.roles.fetch(
    ACCESS_CREATE_ROLE
  );
  if (!accessCreateRole) {
    logger.error("create role not found");
    return;
  }

  // add role
  const guildMember = await interaction.guild.members.fetch(
    interaction.member.user.id
  );
  await retryAddRole(interaction.guild?.members, guildMember, accessCreateRole);

  // whitelist account
  const account = await fetchUsername(application.minecraftUUID);
  await whitelistAccount({
    name: account.name,
    uuid: account.id,
  });

  // update database
  await prisma.whitelistApplication.update({
    where: {
      id: application.id,
    },
    data: {
      status: "accepted",
    },
  });

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
  embed.setDescription(`${gettingStarted}\n<@${application.discordID}>`);
  await applicationsAcceptedChannel.send({
    embeds: [embed],
  });
  // eslint-disable-next-line unicorn/no-await-expression-member
  (await user.createDM(true)).send({
    embeds: [embed],
  });
};
