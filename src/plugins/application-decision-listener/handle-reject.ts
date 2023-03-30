import {
  EmbedBuilder,
  StringSelectMenuInteraction,
  TextChannel,
  User,
} from "discord.js";
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
  const embed = new EmbedBuilder().setTitle("Application declined");
  switch (reason) {
    case ApplicationRejectReason.Underage: {
      embed.setDescription(
        "Your application has been declined for breaking the Discord terms of service. You must be at least thirteen years old."
      );

      await whitelistChannel.send({
        content: `<@${user.id}>`,
        embeds: [embed],
      });

      break;
    }
    case ApplicationRejectReason.NoReasonProvided: {
      embed.setDescription(
        "The reason you provided was either too short or did not provide a sufficient reason for us to approve your application. Please try again."
      );

      await whitelistChannel.send({
        content: `<@${user.id}>`,
        embeds: [embed],
      });
      break;
    }
    case ApplicationRejectReason.OffensiveName: {
      embed.setDescription(whitelistErrorOffensiveName);

      await whitelistChannel.send({
        content: `<@${user.id}>`,
        embeds: [embed],
      });
      break;
    }
    case ApplicationRejectReason.BadAccount: {
      embed.setDescription("Your application has been declined");

      await whitelistChannel.send({
        content: `<@${user.id}>`,
        embeds: [embed],
      });
      break;
    }
    case ApplicationRejectReason.BadReason: {
      embed.setDescription("Your application has been declined");

      await whitelistChannel.send({
        content: `<@${user.id}>`,
        embeds: [embed],
      });
      break;
    }
    case ApplicationRejectReason.Suspended: {
      embed.setDescription(
        "Your application has been declined because applications are suspended. Please try again at a later time. Check the announcements channel for more information."
      );

      await whitelistChannel.send({
        content: `<@${user.id}>`,
        embeds: [embed],
      });
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
