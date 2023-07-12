import { ApplicationSubmissionEmbed } from "@views/application/application-submission-embed";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
} from "discord.js";

const $submitButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder()
    .setCustomId("application:apply")
    .setLabel("Apply")
    .setStyle(ButtonStyle.Success),
);

export const applicationCommand = async (message: Message) => {
  const channel = message.channel;
  channel.send({
    embeds: [ApplicationSubmissionEmbed],
    components: [$submitButton],
  });
};
