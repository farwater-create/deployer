import axios from "axios";
import {
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import {
  fetchUsername,
  fetchUUID,
  unwhitelistAccount,
  whitelistAccount,
} from "../lib/minecraft";
import prisma from "../lib/prisma";
import { BotSlashCommand } from "../lib/slash-commands";
import { whitelistEmbed } from "../templates/whitelist-embed";
import { apply } from "./apply";

export const unwhitelist: BotSlashCommand = {
  json: new SlashCommandBuilder()
    .setName("unwhitelist")
    .setDescription("unwhitelist your account")
    .toJSON(),
  handler: async function (interaction: CommandInteraction): Promise<void> {
    const application = await prisma.whitelistApplication.findFirst({
      where: {
        discordID: interaction.user.id,
      },
    });
    if (!application) {
      apply.handler(interaction);
      return;
    }
    if (application.status != "accepted") {
      await interaction.reply({
        content: "Your application is still awaiting approval.",
        ephemeral: true,
      });
      return;
    }
    const profile = await fetchUsername(application.minecraftUUID);
    await interaction.deferReply();
    try {
      await unwhitelistAccount(profile.name);
      await prisma.whitelistApplication.updateMany({
        where: {
          discordID: interaction.user.id,
        },
        data: {
          minecraftUUID: profile.id,
        },
      });
      await interaction.followUp({
        embeds: [whitelistEmbed(profile).setTitle("Removed From Whitelist")],
        ephemeral: true,
      });
    } catch (error) {
      await interaction.followUp("Something went wrong. Is the server up?");
    }
  },
};
