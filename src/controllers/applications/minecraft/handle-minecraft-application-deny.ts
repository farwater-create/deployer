import { toMessageLink } from "@lib/discord-helpers/message-link";
import { logger } from "@logger";
import { MinecraftApplicationDecisionEvent, MinecraftApplicationDecisionMessage, MinecraftApplicationRejectReason, ParseMinecraftApplicationDecisionMessage, minecraftApplicationDenyReasonDescriptions } from "@views/application/minecraft-application-decision-message";
import { MessageEditOptions, StringSelectMenuInteraction, Client } from "discord.js";
import { MinecraftAutoReviewStatus } from "./minecraft-auto-review";
import { config } from "@config";

export const minecraftApplicationDenyHandler = async(
  interaction: StringSelectMenuInteraction
) => {
  if(interaction.customId !== MinecraftApplicationDecisionEvent.Reject) return;
  const value = interaction.values[0] as MinecraftApplicationRejectReason;

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

    denyApplication(interaction.client, application.discordId, value);

  } catch(error) {
    logger.error(error);
  }
}


export const denyApplication = async (client: Client, discordId: string, reason: MinecraftApplicationRejectReason) => {
    const guild = client.guilds.cache.get(config.GUILD_ID);
    if(!guild) {
      throw new Error("guild not found");
    }
    const rejectReasonDescription = minecraftApplicationDenyReasonDescriptions.get(reason);
    const user = await client.users.fetch(discordId);
    if(!user) return;
    const dmChannel = await user.createDM(true);
    await dmChannel.send(`Your farwater application was denied for reason: \`${rejectReasonDescription}\`. If you believe this was an error create a ticket.`);
    const member = await guild.members.fetch(user.id);

    switch(reason) {
      case "other_bannable":
        member.ban();
      case "underage":
        member.ban();
        break;
      case "offensive_application":
        member.ban();
        break;
      case "offensive_discord_user":
        member.kick();
        break;
      case "offensive_skin":
        member.kick();
        break;
      case "offensive_name":
        member.kick();
      default:
        break;
        // do nothing
    }
}
