import { StringSelectMenuInteraction, TextChannel, User } from "discord.js";
import { ApplicationRejectReason } from "../../interfaces/application-reject-reason";
import { config } from "../../lib/config";
import logger from "../../lib/logger";
import prisma from "../../lib/prisma";
import whitelistErrorOffensiveName from "../../templates/whitelist-error-offensive-name";
export const handleReject = async (
  user: User,
  reason: string,
  interaction: StringSelectMenuInteraction
) => {
  const whitelistChannel =
    user.client.channels.cache.get(config.APPLICATIONS_ACCEPTED_CHANNEL) ||
    ((await user.client.channels.fetch(
      config.APPLICATIONS_ACCEPTED_CHANNEL
    )) as TextChannel);
  if (!whitelistChannel || !whitelistChannel.isTextBased()) {
    logger.error("whitelist channel not found");
    return;
  }
  switch (reason) {
    case ApplicationRejectReason.Underage: {
      await whitelistChannel.send(
        `<@${user.id}> Your create application was denied for breaking discord terms of service. You must be at least thirteen years old.`
      );
      break;
    }
    case ApplicationRejectReason.NoReasonProvided: {
      await whitelistChannel.send(
        `<@${user.id}> Your create application was denied for not providing a valid reason. Please try again.`
      );
      break;
    }
    case ApplicationRejectReason.OffensiveName: {
      await whitelistChannel.send(whitelistErrorOffensiveName);
      break;
    }
    case ApplicationRejectReason.BadAccount: {
      await whitelistChannel.send(`<@${user.id}> Your application was denied.`);
      break;
    }
    case ApplicationRejectReason.BadReason: {
      await whitelistChannel.send(`<@${user.id}> Your application was denied.`);
      break;
    }
    case ApplicationRejectReason.Suspended: {
      await whitelistChannel.send(`<@${user.id}> Your application was denied because applications are suspended.
          Please try again at a later date. Check the announcements channel for more information.`);
      break;
    }
    case ApplicationRejectReason.Left: {
      try {
        interaction.message.delete();
        // eslint-disable-next-line no-empty
      } catch {}
    }
  }
  await prisma.whitelistApplication.deleteMany({
    where: {
      discordID: user.id,
    },
  });
};
