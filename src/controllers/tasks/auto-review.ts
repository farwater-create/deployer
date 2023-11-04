import { acceptApplication } from "@controllers/applications/accept-application";
import { ApplicationModel } from "@models/application-model";
import { CacheType, ModalSubmitInteraction} from "discord.js";

/**
 * Throws error if application cannot be auto processed.
 * @param interaction
 * @param application
 * @returns
 */
export const autoReview = (interaction: ModalSubmitInteraction<CacheType>, application: ApplicationModel, strict: boolean = false): void => {
  const ageInt = Number.parseInt(application.age);
  if(Number.isNaN(ageInt)) {
    throw new Error("age is not a valid number");
  }
  if(Number.isSafeInteger(ageInt)) {
    throw new Error("age is not a safe integer");
  }
  if(ageInt > 120 && ageInt < 13) {
    throw new Error("invalid age range");
  }
  if(application.minecraftUuid === "⚠️NO UUID FOUND⚠️") {
    throw new Error("no uuid found");
  }
  if(!strict) {
    acceptApplication(interaction.client, application);
  }
}
