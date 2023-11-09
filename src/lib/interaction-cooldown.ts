import { Interaction } from "discord.js";

const interactionCooldowns = new Map<string, NodeJS.Timer>();

type HasCustomId<T> = {
  customId: string;
} & T;

export const hasCustomId = (
  interaction: Interaction,
): interaction is HasCustomId<Interaction> => {
  return interaction.hasOwnProperty("customId");
};

export const hasCooldown = (
  interaction: Interaction,
  cooldown: number,
): boolean => {
  let id: string | undefined;
  if (hasCustomId(interaction)) {
    id = interaction.customId;
  }
  if (interaction.isCommand()) {
    if (interaction.command?.name) id = interaction.command.name;
  }
  if (!id) return true;
  const key = `${id}:${interaction.user.id}`;
  if (interactionCooldowns.has(key)) return true;
  interactionCooldowns.set(
    key,
    setTimeout(() => {
      interactionCooldowns.delete(key);
    }, cooldown),
  );
  return false;
};
