import { logger } from "@lib/logger";
import { ApplicationModel } from "@models/application-model";
import {
  ApplicationRejectReason,
  getApplicationRejectReasonDescription,
} from "@models/application-rejection-reasons";
import { Interaction, StringSelectMenuInteraction } from "discord.js";
import { parseApplicationDecisionMessage } from "./parse-application-decision-message";

type RejectAction = (
  reason: ApplicationRejectReason,
  application: ApplicationModel,
  interaction: Interaction
) => Promise<void>;

export const rejectApplication = async (interaction: Interaction) => {
  if (!interaction.isStringSelectMenu()) {
    logger.warn(
      `Reject application callback called with interaction that is not a button. Ignoring.`
    );
    return;
  }
  const reason = interaction.values[0] as ApplicationRejectReason;
  const message = interaction.message;
  const embed = message.embeds[0];
  if (!embed) {
    logger.warn(
      `Reject application callback called with interaction that has no embed. Ignoring.`
    );
    return;
  }
  const application = parseApplicationDecisionMessage(message);
  if (!application) {
    logger.warn(
      `Reject application callback called with interaction that has no application data. Ignoring.`
    );
    return;
  }
  try {
    processRejectApplication(reason, application, interaction);
  } catch (e) {
    logger.error(`Error processing reject application callback: ${e}`);
    logger.discord(
      "error",
      `Error processing reject application callback: ${e}`
    );
  }
};

const processRejectApplication = async (
  reason: ApplicationRejectReason,
  application: ApplicationModel,
  interaction: StringSelectMenuInteraction
) => {
  const rejectAction = rejectActions.get(reason) || rejectActionNone;
  try {
    await rejectAction(reason, application, interaction);
    await interaction.reply({
      content: `Application denied for reason: ${getApplicationRejectReasonDescription(
        reason
      )}`,
      ephemeral: true,
    });
    await interaction.message.delete();
  } catch (e) {
    logger.error(
      `Error processing reject application callback for reason ${reason}: ${e}`
    );
    logger.discord(
      "error",
      `Error processing reject application callback for reason ${reason}: ${e}`
    );
  }
};

export const rejectActions = new Map<ApplicationRejectReason, RejectAction>();

export const rejectActionBan: RejectAction = async (
  reason,
  application,
  interaction
) => {
  interaction.guild?.bans.create(application.discordId, {
    reason: `Application denied for reason: ${getApplicationRejectReasonDescription(
      reason
    )}`,
  });
  const member = interaction.guild?.members.cache.get(application.discordId);
  if (member) {
    const dm = await member.createDM();
    dm.send(
      `Your application for ${interaction.guild
        ?.name} was denied for reason: ${getApplicationRejectReasonDescription(
        reason
      )}. You have been banned from the server. If you believe this was a mistake, please contact a staff member.`
    );
  }
};

export const rejectActionKick: RejectAction = async (
  reason,
  application,
  interaction
) => {
  const member = interaction.guild?.members.cache.get(application.discordId);
  if (member) {
    const dm = await member.createDM();
    dm.send(
      `Your application for ${interaction.guild
        ?.name} was denied for reason: ${getApplicationRejectReasonDescription(
        reason
      )}. You have been kicked from the server. If you believe this was a mistake, please contact a staff member.`
    );
    member.kick(
      `Application denied for reason: ${getApplicationRejectReasonDescription(
        reason
      )}`
    );
  } else {
    logger.error(
      `Could not find member with id ${
        application.discordId
      } to kick, but application was denied for reason: ${getApplicationRejectReasonDescription(
        reason
      )}`
    );
  }
};

export const rejectActionNone: RejectAction = async (
  reason,
  application,
  interaction
) => {
  const member = interaction.guild?.members.cache.get(application.discordId);
  if (!member) {
    logger.error(
      `Could not find member with id ${
        application.discordId
      } to send application denial message, but application was denied for reason: ${getApplicationRejectReasonDescription(
        reason
      )}. Assuming they left the server, and not sending a DM.`
    );
    return;
  }
  const dm = await member.createDM();
  dm.send(
    `Your application for ${interaction.guild
      ?.name} was denied for reason: ${getApplicationRejectReasonDescription(
      reason
    )}. Please resolve the issue and reapply. If you are unsure of the reason, please contact a staff member.`
  );
};

export const rejectActionCooldown: RejectAction = async (
  reason,
  application,
  interaction
) => {
  const member = interaction.guild?.members.cache.get(application.discordId);
  if (!member) {
    logger.error(
      `Could not find member with id ${
        application.discordId
      } to send application denial message, but application was denied for reason: ${getApplicationRejectReasonDescription(
        reason
      )}. Assuming they left the server, and not sending a DM.`
    );
    return;
  }
  const dm = await member.createDM();
  dm.send(
    `Your application for ${interaction.guild
      ?.name} was denied for reason: ${getApplicationRejectReasonDescription(
      reason
    )}. Please wait 24 hours before reapplying or your application will be denied again. If you are unsure of the reason, please contact a staff member.`
  );
};

// Available reject actions:
// - Ban
// - Kick
// - None (send DM)
// - Cooldown (send DM with instructions to wait 24 hours before reapplying)

rejectActions.set("underage", rejectActionBan);
rejectActions.set("no_reason_provided", rejectActionNone);
rejectActions.set("low_effort_application", rejectActionCooldown);
rejectActions.set("offensive_name", rejectActionBan);
rejectActions.set("offensive_skin", rejectActionBan);
rejectActions.set("offensive_username", rejectActionBan);
rejectActions.set("offensive_discord_user", rejectActionBan);
rejectActions.set("offensive_application", rejectActionBan);
rejectActions.set("user_not_in_discord_server", rejectActionNone);
rejectActions.set("no_minecraft_account", rejectActionNone);
rejectActions.set("other", rejectActionNone);
rejectActions.set("other_bannable", rejectActionBan);
