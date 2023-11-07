import { toMessageLink } from "@lib/discord-helpers/message-link";
import { logger } from "@logger";
import { MinecraftApplicationDecisionEvent, MinecraftApplicationDecisionMessage, ParseMinecraftApplicationDecisionMessage } from "@views/application/minecraft-application-decision-message";
import { MessageEditOptions, StringSelectMenuInteraction } from "discord.js";
import { MinecraftAutoReviewStatus } from "./minecraft-auto-review";

export const minecraftApplicationDenyHandler = async(
  interaction: StringSelectMenuInteraction
) => {
  if(interaction.customId !== MinecraftApplicationDecisionEvent.Reject) return;
  const value = interaction.values[0];

  try {
    const application = ParseMinecraftApplicationDecisionMessage(interaction.message);
    const messageEditOptions = MinecraftApplicationDecisionMessage(application, {
      status: MinecraftAutoReviewStatus.Rejected,
      reason: value
    }, interaction.user) as MessageEditOptions;

    const message = await interaction.message.edit({
      ...messageEditOptions,
      components: []
    });

    await interaction.reply({
      ephemeral: true,
      content: `Rejected application: ${toMessageLink(message)}`
    });
  } catch(error) {
    logger.error(error);
  }
}
