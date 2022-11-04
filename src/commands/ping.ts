import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { BotSlashCommand } from "../lib/slash-commands";

export const ping: BotSlashCommand = {
  json: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("responds with pong")
    .toJSON(),
  handler: function (interaction: CommandInteraction): void {
    interaction.reply("pong");
  },
};
