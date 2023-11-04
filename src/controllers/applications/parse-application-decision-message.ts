import { ApplicationModel } from "@models/application-model";
import { Message } from "discord.js";
/**
 * @description Parses an application decision message for application data.
 * @param message
 * @returns An object containing the application data if the message is an application decision message, otherwise undefined.
 */
export const parseApplicationDecisionMessage = (message: Message): ApplicationModel | undefined => {
  const embed = message.embeds[0];

  if (!embed) {
    return undefined;
  }

  const discordId = embed.fields.find((field) => field.name === "discordId");
  const minecraftName = embed.fields.find((field) => field.name === "minecraftName");
  const minecraftUuid = embed.fields.find((field) => field.name === "minecraftUuid");
  const age = embed.fields.find((field) => field.name === "age");

  const reason = embed.description;

  if (!discordId || !minecraftName || !minecraftUuid || !reason || !age) {
    return undefined;
  }

  if(!discordId.value || !minecraftName.value || !minecraftUuid.value || !reason || !age.value) {
    return undefined;
  }

  return {
    discordId: discordId.value,
    minecraftName: minecraftName.value,
    minecraftUuid: minecraftUuid.value,
    reason: reason,
    age: age.value,
  }
};
