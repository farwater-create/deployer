import { logger } from "@logger";
import { MinecraftApplicationModel, ApplicationModel } from "@models/application";
import { ApplicationRejectReason, getApplicationRejectReasonDescription } from "@models/minecraft-application-rejection-reason";
import { Guild, Interaction } from "discord.js";

type RejectAction = (
  reason: ApplicationRejectReason,
  application: MinecraftApplicationModel,
  guild: Guild
) => Promise<void>;

export const rejectMinecraftApplicationHandler = async(interaction: Interaction) => {
  if(!interaction.isStringSelectMenu()) {
    return;
  }
}

export const minecraftApplicationRejectActions = new Map<ApplicationRejectReason, RejectAction>();

export const rejectMinecraftApplication = async (guild: Guild, application: MinecraftApplicationModel, reason: ApplicationRejectReason) => {
  const action = minecraftApplicationRejectActions.get(reason);
  action?.(reason, application, guild);
};

export const rejectActionBan: RejectAction = async (
  reason,
  application,
  guild
) => {
  guild.bans.create(application.discordId, {
    reason: `Application denied for reason: ${getApplicationRejectReasonDescription(
      reason
    )}`,
  });
  const member = guild.members.cache.get(application.discordId);
  if (member) {
    const dm = await member.createDM();
    dm.send(
      `Your application for ${guild
        ?.name} was denied for reason: ${getApplicationRejectReasonDescription(
        reason
      )}. You have been banned from the server. If you believe this was a mistake, please contact a staff member.`
    );
  }
};

export const rejectActionKick: RejectAction = async (
  reason,
  application,
  guild
) => {
  const member = guild.members.cache.get(application.discordId);
  if (member) {
    const dm = await member.createDM();
    dm.send(
      `Your application for ${guild
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
  guild
) => {
  const member = guild.members.cache.get(application.discordId);
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
    `Your application for ${guild
      ?.name} was denied for reason: ${getApplicationRejectReasonDescription(
      reason
    )}. Please resolve the issue and reapply. If you are unsure of the reason, please contact a staff member.`
  );
};

export const rejectActionCooldown: RejectAction = async (
  reason,
  application,
  guild
) => {
  const member = guild.members.cache.get(application.discordId);
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
    `Your application for ${guild
      .name} was denied for reason: ${getApplicationRejectReasonDescription(
      reason
    )}. Please wait 24 hours before reapplying or your application will be denied again. If you are unsure of the reason, please contact a staff member.`
  );
};

// Available reject actions:
// - Ban
// - Kick
// - None (send DM)
// - Cooldown (send DM with instructions to wait 24 hours before reapplying)

minecraftApplicationRejectActions.set("underage", rejectActionBan);
minecraftApplicationRejectActions.set("no_reason_provided", rejectActionNone);
minecraftApplicationRejectActions.set("low_effort_application", rejectActionCooldown);
minecraftApplicationRejectActions.set("offensive_name", rejectActionBan);
minecraftApplicationRejectActions.set("offensive_skin", rejectActionBan);
minecraftApplicationRejectActions.set("offensive_username", rejectActionBan);
minecraftApplicationRejectActions.set("offensive_discord_user", rejectActionBan);
minecraftApplicationRejectActions.set("offensive_application", rejectActionBan);
minecraftApplicationRejectActions.set("user_not_in_discord_server", rejectActionNone);
minecraftApplicationRejectActions.set("no_minecraft_account", rejectActionNone);
minecraftApplicationRejectActions.set("other", rejectActionNone);
minecraftApplicationRejectActions.set("other_bannable", rejectActionBan);
