import { applicationSubmit } from "@controllers/applications/submit";
import { ApplicationSubmissionModal } from "@views/application/application-submission-modal";
import { Interaction } from "discord.js";
export const interactionCreate = async (interaction: Interaction) => {
  // todo: hide all this behind some kind of state machine

  if (interaction.isButton()) {
    if (interaction.customId === "application:apply") {
      await interaction.showModal(ApplicationSubmissionModal());
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === "application:submit") {
      applicationSubmit(interaction);
    }
  }
};
