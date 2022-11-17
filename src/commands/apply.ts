import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import prisma from "../lib/prisma";
import { BotSlashCommand } from "../lib/slash-commands";
import { WhitelistApplicationModal } from "../templates/whitelist-application-modal";

export const apply: BotSlashCommand = {
  json: new SlashCommandBuilder()
    .setName("apply")
    .setDescription("responds with pong")
    .toJSON(),
  handler: async function (interaction: CommandInteraction): Promise<void> {
    const application = await prisma.whitelistApplication.findFirst({
      where: {
        discordID: interaction.user.id,
      },
    });
    if (application) {
      await interaction.reply({
        content: "You've already submited an application.",
        ephemeral: true,
      });
      return;
    }
    await interaction.showModal(WhitelistApplicationModal);
  },
};
``;
