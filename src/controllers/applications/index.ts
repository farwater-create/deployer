import { logger } from "@lib/logger";
import { ApplicationModel } from "@models/application-model";
import { ApplicationRejectReason } from "@models/application-rejection-reasons";
import { Interaction } from "discord.js";

type DenyAction = (
  reason: ApplicationRejectReason,
  application: ApplicationModel,
  interaction: Interaction,
) => void;

export const denyActions = new Map<ApplicationRejectReason, DenyAction>();

export const denyActionBan: DenyAction = async (
  reason,
  application,
  interaction,
) => {
  interaction.guild?.bans.create(application.discordId, {
    reason: `Application denied for reason: ${reason}`,
  });
  const member = interaction.guild?.members.cache.get(application.discordId);
  if (member) {
    const dm = await member.createDM();
    dm.send(
      `Your application for ${interaction.guild?.name} was denied for reason: ${reason}. You have been banned from the server. If you believe this was a mistake, please contact a staff member.`,
    );
  }
};

export const denyActionKick: DenyAction = async (
  reason,
  application,
  interaction,
) => {
  const member = interaction.guild?.members.cache.get(application.discordId);
  if (member) {
    const dm = await member.createDM();
    dm.send(
      `Your application for ${interaction.guild?.name} was denied for reason: ${reason}. You have been kicked from the server. If you believe this was a mistake, please contact a staff member.`,
    );
    member.kick(`Application denied for reason: ${reason}`);
  } else {
    logger.error(
      `Could not find member with id ${application.discordId} to kick, but application was denied for reason: ${reason}`,
    );
  }
};

export const denyActionNone: DenyAction = async (
  reason,
  application,
  interaction,
) => {
  const member = interaction.guild?.members.cache.get(application.discordId);
  if (!member) {
    logger.error(
      `Could not find member with id ${application.discordId} to send application denial message, but application was denied for reason: ${reason}. Assuming they left the server, and not sending a DM.`,
    );
    return;
  }
  const dm = await member.createDM();
  dm.send(
    `Your application for ${interaction.guild?.name} was denied for reason: ${reason}. Please resolve the issue and reapply. If you are unsure of the reason, please contact a staff member.`,
  );
};

export const denyActionCooldown: DenyAction = async (
  reason,
  application,
  interaction,
) => {
  const member = interaction.guild?.members.cache.get(application.discordId);
  if (!member) {
    logger.error(
      `Could not find member with id ${application.discordId} to send application denial message, but application was denied for reason: ${reason}. Assuming they left the server, and not sending a DM.`,
    );
    return;
  }
  const dm = await member.createDM();
  dm.send(
    `Your application for ${interaction.guild?.name} was denied for reason: ${reason}. Please wait 24 hours before reapplying or your application will be denied again. If you are unsure of the reason, please contact a staff member.`,
  );
};

// Available deny actions:
// - Ban
// - Kick
// - None (send DM)
// - Cooldown (send DM with instructions to wait 24 hours before reapplying)

denyActions.set("underage", denyActionBan);
denyActions.set("no_reason_provided", denyActionNone);
denyActions.set("low_effort_application", denyActionCooldown);
denyActions.set("offensive_name", denyActionBan);
denyActions.set("offensive_skin", denyActionBan);
denyActions.set("offensive_username", denyActionBan);
denyActions.set("offensive_discord_user", denyActionBan);
denyActions.set("offensive_application", denyActionBan);
denyActions.set("user_not_in_discord_server", denyActionNone);
denyActions.set("no_minecraft_account", denyActionNone);
