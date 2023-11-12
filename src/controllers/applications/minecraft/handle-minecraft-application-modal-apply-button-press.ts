import { prisma } from "@lib/prisma";
import { MinecraftApplicationEvent } from "@views/application/minecraft-application-start-message";
import { MinecraftApplicationModal } from "@views/application/minecraft-application-submit-modal";
import { ButtonInteraction } from "discord.js";

export const handleMinecraftApplicationModalApplyButtonPress = async (
  interaction: ButtonInteraction,
) => {
  const i = interaction as ButtonInteraction;
  if (i.customId !== MinecraftApplicationEvent.Start) return;
  const serverId = interaction.message.embeds[0].fields.find(f => f.name === "serverId")?.value;
  if(!serverId) return;

  const exists = await prisma.minecraftApplication.findFirst({
    where: {
      serverId,
      discordId: interaction.user.id
    }
  });

  if(exists) {
     i.reply({
       ephemeral: true,
       content: "You are already part of this server.",
     });
     return;
  }

  i.showModal(MinecraftApplicationModal());
};
