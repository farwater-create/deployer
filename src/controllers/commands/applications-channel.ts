import { Command } from "@models/command";
import { MinecraftApplicationStartMessageOptions } from "@views/application/minecraft-application-start-message";
import { SlashCommandBuilder, PermissionsBitField, SlashCommandStringOption } from "discord.js";

export const applicationsChannelCommand: Command = {
  json: new SlashCommandBuilder()
    .setName("applications-channel")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .setDescription("Creates the initial application message.")
    .addStringOption(o => o.setName("serverid").setRequired(true).setDescription("deployer server id"))
    .toJSON(),
  handler: (interaction) => {
    const serverId = interaction.options.get("serverid", true).value as string;
    interaction.channel?.send(MinecraftApplicationStartMessageOptions(serverId));
    interaction.reply({
      ephemeral: true,
      content: "created application message"
    })
  },
}
