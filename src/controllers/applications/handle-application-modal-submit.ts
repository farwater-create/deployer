import { ComponentType, Interaction } from "discord.js";
import { config } from "@config";
import { logger } from "@logger";
import { ChannelType } from "discord.js";
import { ApplicationDecisionMessage } from "@views/application/application-decision-message";
import z from "zod";
import { userToMentionString } from "@lib/discord-helpers/mentions";
import { autoReview } from "@controllers/tasks/auto-review";
const { APPLICATIONS_CHANNEL_ID } = config;

export const processApplicationSubmitForm = async (
  interaction: Interaction,
) => {
  if (!interaction.isModalSubmit()) {
    logger.warn("Interaction is not a modal submit");
    return;
  }
  let age = interaction.fields.getField("age", ComponentType.TextInput).value;
  const reason = interaction.fields.getField(
    "reason",
    ComponentType.TextInput,
  ).value;
  const minecraftName = interaction.fields.getField(
    "minecraftName",
    ComponentType.TextInput,
  ).value;
  const channel = interaction.client.channels.cache.get(APPLICATIONS_CHANNEL_ID);
  if (!channel || channel.type !== ChannelType.GuildText) {
    logger.error(
      `Could not find log channel with id ${APPLICATIONS_CHANNEL_ID} to log application submission`,
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
    logger.discord(
      "warn",
      `Application submitted but minecraft uuid not found for user ${userToMentionString(
        interaction.user.id
      )} with name ${minecraftName}`
    );
  }

  const application = {
    discordId: interaction.user.id,
    age,
    reason,
    minecraftName,
    minecraftUuid
  }
  
  try {
    autoReview(interaction, application);
  } catch {
    await channel.send(ApplicationDecisionMessage(application));
    await interaction.reply({
      content:
        "Your application has been submitted. Please wait for a staff member to review it.",
      ephemeral: true,
    });
  }
};
