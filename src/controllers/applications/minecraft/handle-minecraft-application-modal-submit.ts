import { logger } from "@logger";
import { MinecraftApplicationDecisionMessageOptions } from "@views/application/minecraft-application-decision-message";
import { ComponentType, ChannelType, ModalSubmitInteraction } from "discord.js";
import z from "zod";
import { config } from "@config";
import { MinecraftApplicationModalEvent } from "views/application/minecraft-application-submit-modal";
import { digestSkinHex, getSkin } from "@lib/skin-id/skin-id";
import { MinecraftApplicationModel } from "@models/application";
import { MinecraftApplication } from "./application";
const { APPLICATIONS_CHANNEL_ID } = config;

export const handleMinecraftApplicationModalSubmit = async (
  interaction: ModalSubmitInteraction,
) => {
  if (interaction.customId !== MinecraftApplicationModalEvent.Submit) return;

  let age = interaction.fields.getField("age", ComponentType.TextInput).value;
  const reason = interaction.fields.getField(
    "reason",
    ComponentType.TextInput,
  ).value;
  const minecraftName = interaction.fields.getField(
    "minecraftName",
    ComponentType.TextInput,
  ).value;
  const channel = interaction.client.channels.cache.get(
    APPLICATIONS_CHANNEL_ID,
  );
  if (!channel || channel.type !== ChannelType.GuildText) {
    logger.discord(
      "error",
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
  } catch {}

  const minecraftSkinSum = await digestSkinHex(await getSkin(minecraftUuid));

  const applicationOptions: MinecraftApplicationModel = {
    discordId: interaction.user.id,
    age,
    reason,
    minecraftName,
    minecraftUuid,
    minecraftSkinSum,
  };

  const application = new MinecraftApplication(applicationOptions);



  const autoReviewResult = await application.autoReviewResult(
    application,
  );

  await channel.send(
    MinecraftApplicationDecisionMessageOptions(application, autoReviewResult),
  );

  await interaction.reply({
    content:
      "Your application has been submitted. Applications can take up to three days to review.",
    ephemeral: true,
  });
};
