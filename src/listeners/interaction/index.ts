import { processApplicationSubmitForm } from "@controllers/applications/process-application-submit-form";
import { rejectApplication } from "@controllers/applications/reject-application";
import { showApplicationSubmitForm } from "@controllers/applications/show-application-submit-form";
import { ApplicationCallback } from "@models/application-callback-id";
import { Interaction } from "discord.js";

type InteractionCallback = (interaction: Interaction) => Promise<void>;
const callBacks = new Map<string, InteractionCallback>();

callBacks.set(ApplicationCallback.Start, showApplicationSubmitForm);
callBacks.set(ApplicationCallback.Submit, processApplicationSubmitForm);
callBacks.set(ApplicationCallback.Reject, rejectApplication);

export const interactionCreate = async (interaction: Interaction) => {
  if (interaction.hasOwnProperty("customId")) {
    console.log("interactionCreate", interaction);
    const _interaction = interaction as Interaction & { customId: string };
    callBacks.get(_interaction.customId)?.(interaction);
  }
};
