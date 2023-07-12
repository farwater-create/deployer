import { ComponentType, ModalSubmitInteraction, TextChannel } from "discord.js";
import { config } from "@config";
import { logger } from "@logger";
import { ChannelType } from "discord.js";
import { ApplicationDecisionEmbed } from "@views/application/application-decision-embed";
import z from "zod";
const { LOG_CHANNEL_ID } = config;

export const applicationSubmit = async (
  interaction: ModalSubmitInteraction,
) => {
  const age = interaction.fields.getField("age", ComponentType.TextInput).value;
  const reason = interaction.fields.getField(
    "reason",
    ComponentType.TextInput,
  ).value;
  const minecraftName = interaction.fields.getField(
    "minecraftName",
    ComponentType.TextInput,
  ).value;

  const channel = interaction.client.channels.cache.get(LOG_CHANNEL_ID);
  if (!channel || channel.type !== ChannelType.GuildText) {
    logger.error(
      `Could not find log channel with id ${LOG_CHANNEL_ID} to log application submission`,
    );
    return;
  }

  let minecraftUuid = "⚠️NO UUID FOUND⚠️";
  try {
    const response = await fetch(
      "https://api.mojang.com/users/profiles/minecraft/" + minecraftName,
    );
    const expectedResponseSchema = z.object({
      id: z.string(),
      name: z.string(),
    });
    const result = expectedResponseSchema.parse(await response.json());
    minecraftUuid = result.id;
  } catch (e) {
    logger.error(`Could not find minecraft uuid for ${minecraftName}`);
  }

  await channel.send({
    embeds: [
      ApplicationDecisionEmbed({
        age,
        reason,
        minecraftName,
        minecraftUuid,
        discordId: interaction.user.id,
      }),
    ],
  });

  await interaction.reply({
    content:
      "Your application has been submitted. Please wait for a staff member to review it.",
    ephemeral: true,
  });
};
