import { WhitelistApplication } from "@prisma/client";
import {
  SlashCommandBuilder,
  CommandInteraction,
  SlashCommandUserOption,
  SlashCommandStringOption,
  PermissionFlagsBits,
} from "discord.js";
import logger from "../lib/logger";
import { fetchUsername, fetchUUID } from "../lib/minecraft";
import prisma from "../lib/prisma";
import { BotSlashCommand } from "../lib/slash-commands";
import { userEmbed } from "../templates/user-embed";

export const whois: BotSlashCommand = {
  json: new SlashCommandBuilder()
    .setName("whois")
    .setDescription("Find out who a user is")
    .addUserOption(
      new SlashCommandUserOption()
        .setDescription("a discord account")
        .setName("discord")
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setDescription("a minecraft account")
        .setName("minecraft")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .toJSON(),
  handler: async function (interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();
    let user = interaction.options.getUser("discord", false);
    const minecraftUsername = interaction.options
      .get("minecraft", false)
      ?.value?.toString();

    if (!user && !minecraftUsername) {
      await interaction.followUp({
        content:
          "you must provide a value for discord user or minecraft username",
        ephemeral: true,
      });
      return;
    }

    let minecraftAccount:
      | {
          name: string;
          id: string;
        }
      | undefined;

    let application: WhitelistApplication | null;

    if (minecraftUsername) {
      try {
        minecraftAccount = await fetchUUID(minecraftUsername);
      } catch (error) {
        logger.error(error);
        return;
      }
      application = await prisma.whitelistApplication.findFirst({
        where: {
          minecraftUUID: minecraftAccount.id,
        },
      });
      if (!application) {
        await interaction.followUp({
          content: `user ${minecraftUsername} is not part of Farwater`,
          ephemeral: true,
        });
        return;
      }
      user =
        interaction.client.users.cache.get(application.discordID) ||
        (await interaction.client.users.fetch(application.discordID));
      if (!user) {
        await interaction.followUp({
          content: `the user associated with this account is not on the server`,
          ephemeral: true,
        });
      }
    } else if (user) {
      application = await prisma.whitelistApplication.findFirst({
        where: {
          discordID: user.id,
        },
      });
      if (!application) {
        await interaction.followUp({
          content: `user ${user.username} is not registered.`,
          ephemeral: true,
        });
        return;
      }
      try {
        minecraftAccount = await fetchUsername(application?.minecraftUUID);
      } catch {
        await interaction.followUp({
          content: `error while fetching ${user.username}'s minecraft account`,
          ephemeral: true,
        });
        return;
      }
    } else {
      await interaction.followUp({
        content: "Internal server error",
        ephemeral: true,
      });
      return;
    }

    if (!application || !user) {
      await interaction.followUp({
        content: "Internal server error",
        ephemeral: true,
      });
      return;
    }

    await interaction.followUp({
      embeds: [userEmbed(minecraftAccount, user)],
      ephemeral: true,
    });
  },
};
