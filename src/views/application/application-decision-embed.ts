import { ApplicationModel } from "@models/application-model";
import { ApplicationRejectReasons } from "@models/application-rejection-reasons";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SelectMenuBuilder,
  StringSelectMenuBuilder,
} from "discord.js";

export const ApplicationSubmitEmbed = new EmbedBuilder();

export const ApplicationDecisionEmbed = ({
  discordId,
  age,
  reason,
  minecraftName,
}: ApplicationModel) => {
  const $acceptButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`create-application-accept:${discordId}`)
      .setLabel("Accept")
      .setStyle(ButtonStyle.Success),
  );

  const $rejectButton = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`create-application-reject:${discordId}`)
      .addOptions(ApplicationRejectReasons)
      .setPlaceholder("Reject with reason"),
  );

  return new EmbedBuilder()
    .setTitle("Whitelist Application")
    .addFields([
      {
        name: "age",
        value: `${age}`,
      },
      {
        name: "reason",
        value: `${reason}`,
      },
      {
        name: "minecraft_uuid",
        value: minecraftName,
      },
      {
        name: "minecraft_name",
        value: `[link](https://namemc.com/profile/${minecraftName})`,
      },
      {
        name: "minecraft_skin",
        value: `[link](https://mc-heads.net/body/${minecraftName}.png)`,
      },
    ])
    .setThumbnail(`https://mc-heads.net/body/${minecraftName}.png`)
    .setImage(`https://mc-heads.net/body/${minecraftName}.png`);
};
