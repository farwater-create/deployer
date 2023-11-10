import { Command } from "@models/command";
import { MinecraftApplicationStartMessageOptions } from "@views/application/minecraft-application-start-message";
import { SlashCommandBuilder, PermissionsBitField } from "discord.js";

export const applicationsChannelCommand: Command = {
  json: new SlashCommandBuilder()
    .setName("applications-channel")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .setDescription("Creates the initial application message.")
    .toJSON(),
  handler: (interaction) => {
    interaction.channel?.send(MinecraftApplicationStartMessageOptions);
  },
}
