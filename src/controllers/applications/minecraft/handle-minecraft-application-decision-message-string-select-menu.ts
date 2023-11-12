import { toMessageLink } from "@lib/discord-helpers/message-link";
import { logger } from "@logger";
import {
  MessageEditOptions,
  StringSelectMenuInteraction
} from "discord.js";
import { MinecraftApplicationDecisionEvent, MinecraftApplicationDecisionMessageOptions } from "@views/application/minecraft-application-decision-message";
import { MinecraftApplication } from "./application";
import { MinecraftApplicationAutoReviewStatus } from "@models/application/application";
import { MinecraftApplicationRejectReason, minecraftApplicationRejectReasons } from "@models/application/reject-reasons";
import { config } from "@config";

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

  const { discordId } = application;
  const guild = interaction.client.guilds.cache.get(config.GUILD_ID);
  if (!guild) {
    throw new Error("guild not found");
  }
  const rejectReasonDescription = minecraftApplicationRejectReasons[value];
  const user = await interaction.client.users.fetch(discordId);
  if (!user) return;
  const dmChannel = await user.createDM(true);

  try {
    const reply = `Your farwater application was denied for reason: \`${rejectReasonDescription}\`. If you believe this was an error create a ticket.`;
    let footnotes: string | undefined;
    switch (value) {
      case "otherBannable":
        break;
      case "underage":
        break;
      case "offensiveApplication":
        footnotes =
          "Create a ticket if you wish to re-apply with an apology.";
        break;
      case "offensiveDiscordUser":
        footnotes =
          "Create a ticket if you wish to re-apply with an apology.";
        break;
      case "offensiveMinecraftSkin":
        await application.flagOffensiveSkin();
        footnotes =
          "Create a ticket if you wish to re-apply with an apology.";
        break;
      case "userLeftDiscordServer":
        break;
      case "noMinecraftAccount":
        footnotes =
          "Double check your minecraft name (case sensitive) and apply again.";
        break;
      case "invalidAge":
        footnotes = "Please enter a valid age when re-applying";
        break;
      default:
      case "lowEffortApplication":
        footnotes =
          "Please give more reasons for why you want to join farwater then apply again.";
        break;
    }
    await dmChannel.send(`${reply}\n${footnotes}`);
  } catch (error) {
    logger.discord(
      "warn",
      "Tried to send dm to user " + user.id + " but user has dms closed."
    );
  }

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
