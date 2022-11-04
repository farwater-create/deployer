import {
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import { BotSlashCommand } from "../lib/slash-commands";

export const whitelist: BotSlashCommand = {
  json: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("whitelist yourself on the server")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("minecraft username")
        .setDescription("your minecraft username")
        .setRequired(true)
    )
    .toJSON(),
  handler: function (interaction: CommandInteraction): void {
    interaction.reply("pong");
  },
};
