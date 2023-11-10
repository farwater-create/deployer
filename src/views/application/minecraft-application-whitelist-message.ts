import { MinecraftApplication } from "@controllers/applications/minecraft/application";
import { EmbedBuilder, MessageReplyOptions } from "discord.js";

export const MinecraftApplicationWhitelistMessageOptions = (
  application: MinecraftApplication,
): MessageReplyOptions => {
  const { minecraftName } = application;
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle("Whitelisted " + minecraftName)
        .setImage(new URL(`https://mc-heads.net/body/${minecraftName}.png`).toString())
        .setDescription(`<@${application.discordId}> your application for Farwater Minecraft has been accepted.`)
    ],
  };
};
