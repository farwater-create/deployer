import { MinecraftApplicationEvent } from "@views/application/minecraft-application-start-message";
import { MinecraftApplicationModal } from "@views/application/minecraft-application-submit-modal";
import { ButtonInteraction } from "discord.js";

export const minecraftApplicationModalApplyButtonHandler = async(
  interaction: ButtonInteraction
) => {
  const i = interaction as ButtonInteraction;
  if(i.customId !== MinecraftApplicationEvent.Start) return;
  i.showModal(MinecraftApplicationModal())
}
