import { toMessageLink } from "@lib/discord-helpers/message-link";
import { logger } from "@logger";
import {
  MessageEditOptions,
  StringSelectMenuInteraction,
  Client,
} from "discord.js";
import { MinecraftApplicationAutoReviewStatus, MinecraftApplicationRejectReason } from "@models/application";
import { MinecraftApplicationDecisionEvent, MinecraftApplicationDecisionMessageOptions } from "@views/application/minecraft-application-decision-message";
import { MinecraftApplication } from "./application";

export const handleMinecraftApplicationDecisionMessageStringSelectMenu = async (
  interaction: StringSelectMenuInteraction,
) => {
  if (interaction.customId !== MinecraftApplicationDecisionEvent.Reject) return;
  const value = interaction.values[0] as MinecraftApplicationRejectReason;
  let application: MinecraftApplication | undefined;

  try  {
    application = MinecraftApplication.fromMinecraftApplicationDecisionMessage(
      interaction.message,
    );
  } catch(error) {
    logger.error(error);
    return;
  }
  if (!application) return;



  const messageEditOptions = MinecraftApplicationDecisionMessageOptions(
    application,
    {
      status: MinecraftApplicationAutoReviewStatus.Rejected,
      reason: value,
    },
    interaction.user,
  ) as MessageEditOptions;

    const message = await interaction.message.edit({
      ...messageEditOptions,
      components: [],
    }).catch(err => logger.error(err));
    if(!message) return;

    await interaction.reply({
      ephemeral: true,
      content: `Rejected application: ${toMessageLink(
        message,
      )}. Remember to take the appropriate administrative action.`,
    }).catch(err => logger.error(err))
};
