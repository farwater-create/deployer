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

  if(!age || !reason || !minecraftName) {
    interaction.reply("You must provide a valid age, reason, and minecraft name!")
    .catch(logger.error);
    return;
  }

  const applicationDecisionChannel = interaction.client.channels.cache.get(
    APPLICATIONS_CHANNEL_ID,
  );

  if (
    !applicationDecisionChannel ||
    applicationDecisionChannel.type !== ChannelType.GuildText
  ) {
    logger.discord(
      "error",
      `Could not find log channel with id ${APPLICATIONS_CHANNEL_ID} to log application submission`
    );
    return;
  }

  let minecraftUuid = "⚠️NO UUID FOUND⚠️";
  const response = await fetch(
    "https://api.mojang.com/users/profiles/minecraft/" + minecraftName,
  ).catch(logger.error);
  if(!response) return;
  const expectedResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
  });

  const result = await expectedResponseSchema.parseAsync(await response.json())
  .catch(() => undefined);
  if(!result) {
    interaction.reply({
      ephemeral: true,
      content: "Minecraft account not found"
    }).catch(logger.error)
    return;
  }

  minecraftUuid = result.id;

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
  ).catch(logger.error);
  if(!autoReviewResult) return;

  const message = await applicationDecisionChannel.send(
    MinecraftApplicationDecisionMessageOptions(application, autoReviewResult),
  ).catch(err => logger.error(err));
  if(!message) return;

  await interaction.reply({
    content:
      "Your application has been submitted. Applications can take up to three days to review.",
    ephemeral: true,
  }).catch(logger.error);
};
