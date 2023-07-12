import { ApplicationSubmissionModal } from "@views/application/application-submission-modal";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
} from "discord.js";

const $submitButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder()
    .setCustomId("application:apply")
    .setLabel("apply")
    .setStyle(ButtonStyle.Success),
);

export const applicationCommand = async (message: Message) => {
  const channel = message.channel;
  channel.send({
    embeds: [ApplicationSubmissionModal().toJSON()],
    components: [$submitButton],
  });
};
