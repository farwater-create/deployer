import { toMessageLink } from "@lib/discord-helpers/message-link";
import { logger } from "@logger";
import {
  MinecraftApplicationDecisionEvent,
  MinecraftApplicationDecisionMessageOptions,
  MinecraftApplicationRejectReason,
  ParseMinecraftApplicationDecisionMessage,
  minecraftApplicationDenyReasonDescriptions,
} from "@views/application/minecraft-application-decision-message";
import {
  MessageEditOptions,
  StringSelectMenuInteraction,
  Client,
} from "discord.js";
import { MinecraftApplicationAutoReviewStatus } from "./auto-review-minecraft-application";
import { config } from "@config";
import { addSkinToBadSkinDatabase, getSkin } from "@lib/skin-id/skin-id";
import { MinecraftApplicationModel } from "@models/application";
import { loggedKick } from "@lib/discord-helpers/logged-kick";

export const handleMinecraftApplicationDecisionMessageStringSelectMenu = async (
  interaction: StringSelectMenuInteraction,
) => {
  if (interaction.customId !== MinecraftApplicationDecisionEvent.Reject) return;
  const value = interaction.values[0] as MinecraftApplicationRejectReason;

  try {
    const application = ParseMinecraftApplicationDecisionMessage(
      interaction.message,
    );

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
    });

    await interaction.reply({
      ephemeral: true,
      content: `Rejected application: ${toMessageLink(
        message,
      )}. Remember to take the appropriate administrative action.`,
    });

    denyApplication(interaction.client, application, value);
  } catch (error) {
    logger.discord("error", error);
  }
};

export const denyApplication = async (
  client: Client,
  application: MinecraftApplicationModel,
  reason: MinecraftApplicationRejectReason,
) => {
  const { discordId, minecraftUuid } = application;
  const guild = client.guilds.cache.get(config.GUILD_ID);
  if (!guild) {
    throw new Error("guild not found");
  }
  const rejectReasonDescription =
    minecraftApplicationDenyReasonDescriptions.get(reason);
  const user = await client.users.fetch(discordId);
  const member = guild.members.cache.get(user.id);
  if (!user) return;
  const dmChannel = await user.createDM(true);
  try {
    await dmChannel.send(
      `Your farwater application was denied for reason: \`${rejectReasonDescription}\`. If you believe this was an error create a ticket.`,
    );
    switch (reason) {
      case "other_bannable":
        loggedKick(member, reason);
        break;
      case "underage":
        loggedKick(member, reason);
        break;
      case "offensive_application":
        loggedKick(member, reason);

        break;
      case "offensive_discord_user":
        loggedKick(member, reason);
        break;
      case "offensive_skin":
        const skin = await getSkin(minecraftUuid);
        if (!skin) {
          break;
        }
        await addSkinToBadSkinDatabase(skin);
        loggedKick(member, reason);
        break;
      case "offensive_name":
        loggedKick(member, reason);
        break;
      case "no_reason_provided":
        await dmChannel.send("Please reapply with a valid reason");
        break;
      case "user_not_in_discord_server":
        break;
      case "no_minecraft_account":
        await dmChannel.send(
          "Double check your minecraft name (case sensitive) and apply again.",
        );
        break;
      case "invalid_age":
        await dmChannel.send("Please enter a valid age when re-applying");
      default:
      case "low_effort_application":
        await dmChannel.send(
          "Please give more reasons for why you want to join farwater then apply again.",
        );
        break;
      // do nothing
    }
  } catch (error) {
    logger.discord(
      "warn",
      "Tried to send dm to user " + user.id + " but user has dms closed.",
    );
  }
};
