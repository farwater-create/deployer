import { logger } from "@logger";
import { ApplicationSubmitFormModal } from "@views/application/application-submit-form-modal";
import { Interaction } from "discord.js";

export const showApplicationSubmitForm = async (interaction: Interaction) => {
  if (!interaction.isButton()) {
    logger.warn("Interaction is not a button");
    return;
  }
  interaction.showModal(ApplicationSubmitFormModal());
};
