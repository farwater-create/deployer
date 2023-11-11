import { config } from "@config";
import { MinecraftApplication } from "@controllers/applications/minecraft/application";
import { PterodactylPanel } from "@controllers/pterodactyl/pterodactyl";
import { prisma } from "@lib/prisma";
import { ApplicationCommandType, ContextMenuCommandBuilder, PermissionsBitField } from "discord.js";
import { logger } from "@logger";

import { ContextCommand } from "@models/command";
import { fetchMinecraftUser } from "@lib/minecraft/fetch-minecraft-user";
export const ban: ContextCommand = {
  json: new ContextMenuCommandBuilder()
    .setName("ban")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
    .setType(ApplicationCommandType.User),
  handler: async (interaction) => {
    if(!interaction.isUserContextMenuCommand()) return;
    if(interaction.user.id === interaction.targetId) {
      await interaction.reply({
        ephemeral: false,
        content: "Nice try, but you can't ban yourself...are you ok?",
      });
    }

    const user = interaction.targetUser;
    const member = await interaction.guild?.members.fetch(user.id).catch(logger.error);

    logger.discord("info", interaction.user.username +  " banned " + interaction.targetUser?.displayName)

    if(!member) {
      await interaction.reply({
        ephemeral: true,
        content: "could not fetch member?"
      }).catch(logger.error);
      return
    }
    await interaction
      .reply({
        ephemeral: true,
        content:
          "Banning discord and minecraft user for " + member.displayName,
      })
      .catch(logger.error);
    if(!member) return;
    member.ban().catch(err => logger.discord("error", "unable to ban " + member.user.displayName + " " + err));
    const application = await MinecraftApplication.byDiscordId(prisma, user.id).catch(logger.error)
    if(!application) return;

    const profile = await fetchMinecraftUser(application.minecraftUuid);
    if(!profile) return;

    await PterodactylPanel.minecraft(config.PTERODACTYL_SERVER_ID).ban(profile.username);
  }
};
