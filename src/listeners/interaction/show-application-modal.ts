import { ApplicationSubmissionModal } from "@views/application/application-submission-modal";
import { ButtonInteraction } from "discord.js";

export const showModal = (interaction: ButtonInteraction) => {
  if (interaction.isButton()) {
    if (interaction.customId === "application:apply") {
      interaction.showModal;
    }
  }
  interaction.showModal(ApplicationSubmissionModal());
};
