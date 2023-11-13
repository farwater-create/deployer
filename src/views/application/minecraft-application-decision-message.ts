import { MinecraftApplicationModel, MinecraftAutoReviewResult, MinecraftApplicationAutoReviewStatus, MinecraftApplicationCustomId } from "@models/application/application";
import { minecraftApplicationRejectReasons } from "@models/application/reject-reasons";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
  Colors,
  EmbedBuilder,
  MessageCreateOptions,
  StringSelectMenuBuilder,
  User,
} from "discord.js";

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
    serverId
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
      {
        name: "serverId",
        value: serverId
      }
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

  const options = Object.entries(minecraftApplicationRejectReasons).map((e) => {
    return {
      label: e[1],
      value: e[0]
    }
  });

  opts.components = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(MinecraftApplicationCustomId.Accept)
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success)
    ),
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(MinecraftApplicationCustomId.Reject)
        .addOptions(options)
        .setPlaceholder("Reject with reason")
    ),
  ];
  return opts;
};
