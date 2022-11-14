import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { fetchUsername, unwhitelistAccount } from "../lib/minecraft";
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
      await unwhitelistAccount({ uuid: profile.id, name: profile.name });
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
      console.error(error);
      await interaction.followUp({
        content: "Something went wrong.",
        ephemeral: true,
      });
    }
  },
};
