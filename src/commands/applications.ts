import {
  CommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import prisma from "../lib/prisma";
import { BotSlashCommand } from "../lib/slash-commands";
import {
  adminApplicationEmbed,
  adminApplicationEmbedComponents,
} from "../templates/admin-application-message";
const APPLICATION_PENDING_CHANNEL = "1013541292300582922";

export const ping: BotSlashCommand = {
  json: new SlashCommandBuilder()
    .setName("applications")
    .setDescription("resync application state")
    .toJSON(),
  handler: async function (interaction: CommandInteraction): Promise<void> {
    if (interaction.channel?.id != APPLICATION_PENDING_CHANNEL) {
      await interaction.reply("You don't have permission to use this command.");
      return;
    }
    const adminApplicationChannel = interaction.client.channels.cache.get(
      APPLICATION_PENDING_CHANNEL
    ) as TextChannel;
    const applications = await prisma.whitelistApplication.findMany({
      where: {
        status: "pending",
      },
    });
    interaction.channel.messages.fetch({});
    for (const application of applications) {
      await adminApplicationChannel.send({
        embeds: [adminApplicationEmbed(application, interaction.user)],
        components: adminApplicationEmbedComponents(application.id),
      });
    }
  },
};
