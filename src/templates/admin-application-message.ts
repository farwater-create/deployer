import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SelectMenuBuilder,
  User,
} from "discord.js";

import { ApplicationRejectReason } from "../interfaces/application-reject-reason";
import { WhitelistApplication } from "@prisma/client";

export function adminApplicationEmbed(
  application: WhitelistApplication,
  user: User
) {
  return new EmbedBuilder()
    .setTitle(`${user.username}'s Create Application`)
    .addFields([
      {
        name: "age",
        value: `${application.age}`,
      },
      {
        name: "reason",
        value: `${application.reason}`,
      },
      {
        name: "application_id",
        value: application.id,
      },
      {
        name: "minecraft_uuid",
        value: application.minecraftUUID,
        inline: false,
      },
      {
        name: "discord_hash",
        value: `${user.username}#${user.discriminator}`,
        inline: false,
      },
      {
        name: "discord",
        value: `<@${application.discordID}>`,
        inline: false,
      },
    ])
    .setThumbnail(user.displayAvatarURL() || user.defaultAvatarURL)
    .setImage(`https://mc-heads.net/body/${application.minecraftUUID}.png`);
}
export const adminApplicationEmbedComponents = (applicationID: string) => {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`create-application-accept:${applicationID}`)
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success)
    ),
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId(`create-application-reject:${applicationID}`)
        .addOptions(
          {
            label: "underage (< 13)",
            value: ApplicationRejectReason.Underage,
          },
          {
            label: "no reason provided",
            value: ApplicationRejectReason.NoReasonProvided,
          },
          {
            label: "bad reason",
            value: ApplicationRejectReason.BadReason,
          },
          {
            label: "offensive name",
            value: ApplicationRejectReason.OffensiveName,
          },
          {
            label: "applications are suspended",
            value: ApplicationRejectReason.Suspended,
          },
          {
            label: "user left the server",
            value: ApplicationRejectReason.Left,
          }
        )
        .setPlaceholder("Reject with reason")
    ),
  ];
};
