import { MinecraftApplicationAutoReviewStatus, MinecraftApplicationModel, MinecraftApplicationRejectReason, MinecraftAutoReviewResult, minecraftApplicationDenyReasons } from "@models/application";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
  Colors,
  EmbedBuilder,
  Message,
  MessageCreateOptions,
  SelectMenuBuilder,
  StringSelectMenuBuilder,
  User,
} from "discord.js";

export enum MinecraftApplicationDecisionEvent {
  Accept = "minecraft-application-decision-accept",
  Reject = "minecraft-application-decision-reject",
}

const MinecraftApplicationDecisionEmbed = (
  minecraftApplication: MinecraftApplicationModel,
  autoReviewResult: MinecraftAutoReviewResult,
  reviewer?: User,
) => {
  const {
    reason,
    discordId,
    minecraftName,
    minecraftUuid,
    age,
    minecraftSkinSum,
  } = minecraftApplication;
  let color: ColorResolvable = Colors.Blurple;

  switch (autoReviewResult.status) {
    case MinecraftApplicationAutoReviewStatus.Accepted:
      color = Colors.Green;
      break;
    case MinecraftApplicationAutoReviewStatus.Rejected:
      color = Colors.Red;
      break;
    case MinecraftApplicationAutoReviewStatus.NeedsManualReview:
      color = Colors.Yellow;
      break;
  }

  const embed = new EmbedBuilder()
    .setTitle("Whitelist Application")
    .setDescription(reason)
    .addFields([
      {
        name: "discordId",
        value: discordId,
      },
      {
        name: "discord",
        value: `<@${discordId}>`,
      },
      {
        name: "age",
        value: age,
      },
      {
        name: "minecraftName",
        value: minecraftName,
      },
      {
        name: "minecraftUuid",
        value: minecraftUuid,
      },
      {
        name: "minecraftSkinSum",
        value: minecraftSkinSum,
      },
      {
        name: "autoReviewComment",
        value: autoReviewResult.reason,
      },
    ])
    .setColor(color);
  const thumbnail = new URL(`https://mc-heads.net/body/${minecraftName}.png`);
  const image = new URL(`https://mc-heads.net/body/${minecraftName}.png`);
  embed.setImage(image.toString());
  embed.setThumbnail(thumbnail.toString());
  if (reviewer) {
    embed.addFields([
      {
        name: "reviewer",
        value: `<@${reviewer.id}>`,
      },
    ]);
  }
  return embed;
};



export const minecraftApplicationDenyReasonDescriptions = new Map<
  MinecraftApplicationRejectReason,
  string
>();


minecraftApplicationDenyReasons.forEach((v) => {
  minecraftApplicationDenyReasonDescriptions.set(v.value, v.label);
});

export const MinecraftApplicationDecisionMessageOptions = (
  application: MinecraftApplicationModel,
  autoReviewResult: MinecraftAutoReviewResult,
  reviewer?: User,
) => {
  const opts: MessageCreateOptions = {
    embeds: [
      MinecraftApplicationDecisionEmbed(
        application,
        autoReviewResult,
        reviewer,
      ),
    ],
  };
  opts.components = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(MinecraftApplicationDecisionEvent.Accept)
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success),
    ),
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(MinecraftApplicationDecisionEvent.Reject)
        .addOptions(minecraftApplicationDenyReasons)
        .setPlaceholder("Reject with reason"),
    ),
  ];
  return opts;
};
