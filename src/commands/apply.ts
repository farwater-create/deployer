import {
  SlashCommandBuilder,
  CommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
  EmbedBuilder,
  TextChannel,
  Interaction,
  ButtonComponent,
  ComponentType,
} from "discord.js";
import { BotSlashCommand } from "../lib/slash-commands";
import { whitelistApplicationModal } from "../templates/whitelist-application-modal";

export const apply: BotSlashCommand = {
  json: new SlashCommandBuilder()
    .setName("apply")
    .setDescription("responds with pong")
    .toJSON(),
  handler: async function (interaction: CommandInteraction): Promise<void> {
    interaction.guild?.channels.fetch("1013541292300582922");
    await interaction.showModal(whitelistApplicationModal);
  },
};
