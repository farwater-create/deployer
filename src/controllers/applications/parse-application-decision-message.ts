import { Message } from "discord.js";

export const parseApplicationDecisionMessage = (message: Message) => {
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
