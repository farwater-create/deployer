import { WhitelistApplication } from "@prisma/client";
import {
  SlashCommandBuilder,
  CommandInteraction,
  SlashCommandUserOption,
  SlashCommandStringOption,
} from "discord.js";
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
    .toJSON(),
  handler: async function (interaction: CommandInteraction): Promise<void> {
    let user = interaction.options.getUser("discord", false);
    const minecraftUsername = interaction.options
      .get("minecraft", false)
      ?.value?.toString();

    if (!user && !minecraftUsername) {
      await interaction.reply(
        "you must provide a value for discord user or minecraft username"
      );
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
        console.error(error);
        return;
      }
      application = await prisma.whitelistApplication.findFirst({
        where: {
          minecraftUUID: minecraftAccount.id,
        },
      });
      if (!application) {
        await interaction.reply(
          `user ${minecraftUsername} is not part of Farwater`
        );
        return;
      }
      user =
        interaction.client.users.cache.get(application.discordID) ||
        (await interaction.client.users.fetch(application.discordID));
      if (!user) {
        await interaction.reply(
          `the user associated with this account is not on the server`
        );
      }
    } else if (user) {
      application = await prisma.whitelistApplication.findFirst({
        where: {
          discordID: user.id,
        },
      });
      if (!application) {
        await interaction.reply(`user ${user.username} is not registered.`);
        return;
      }
      try {
        minecraftAccount = await fetchUsername(application?.minecraftUUID);
      } catch {
        await interaction.reply(
          `error while fetching ${user.username}'s minecraft account`
        );
        return;
      }
    } else {
      await interaction.reply("Internal server error");
      return;
    }

    if (!application || !user) {
      await interaction.reply("Internal server error");
      return;
    }

    await interaction.reply({
      embeds: [userEmbed(minecraftAccount, user)],
    });
  },
};
