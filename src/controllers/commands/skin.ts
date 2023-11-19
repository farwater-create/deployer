import { MinecraftApplication } from "@controllers/applications/minecraft/application";
import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";
import { logger } from "@logger";

import { ContextCommand } from "@models/command";
export const skin: ContextCommand = {
  json: new ContextMenuCommandBuilder()
    .setName("skins")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
    .setType(ApplicationCommandType.User),
  handler: async (interaction) => {
    if (!interaction.isUserContextMenuCommand()) return;
    const user = interaction.targetUser;
    const applications = await MinecraftApplication.fromDiscordId(
      interaction.client,
      user.id
    ).catch(logger.error);
    if (!applications) {
      await interaction.reply({
        ephemeral: true,
        content: "user has not applied to any servers"
      });
      return;
    }
    const skinURLS = await Promise.all(applications.map(a => a.skinURL()));
    const description = skinURLS.join('\n');
    await interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
        .setDescription(description)
      ]
    })
  },
};
