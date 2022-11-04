import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  SelectMenuBuilder,
  TextInputBuilder,
} from "discord.js";
import { ApplicationRejectReason } from "../interfaces/ApplicationRejectReason";
import { WhitelistApplication } from "../interfaces/WhitelistApplication";

export function adminApplicationEmbed(application: WhitelistApplication) {
  return new EmbedBuilder()
    .setTitle(`${application.discordUsername}'s Create Application`)
    .addFields([
      {
        name: "minecraft uuid",
        value: application.minecraftUUID,
        inline: false,
      },
      {
        name: "discord name",
        value: application.discordUsername,
        inline: false,
      },
      {
        name: "discord id",
        value: application.discordID,
        inline: false,
      },
    ]);
}

export const adminApplicationEmbedComponents = [
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("create-application-accept")
      .setLabel("Accept")
      .setStyle(ButtonStyle.Success)
  ),
  new ActionRowBuilder<SelectMenuBuilder>().addComponents(
    new SelectMenuBuilder().setCustomId("create-application-reject").addOptions(
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
      }
    )
  ),
];
