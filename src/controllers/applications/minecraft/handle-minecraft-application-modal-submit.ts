import { logger } from "@logger";
import { MinecraftApplicationDecisionMessageOptions } from "@views/application/minecraft-application-decision-message";
import { ComponentType, ChannelType, ModalSubmitInteraction } from "discord.js";
import z from "zod";
import { config } from "@config";
import { MinecraftApplicationModalEvent } from "views/application/minecraft-application-submit-modal";
import { digestSkinHex, getSkin } from "@lib/skin-id/skin-id";
import { MinecraftApplicationModel } from "@models/application";
import { MinecraftApplication } from "./application";
import { fetchMinecraftUser } from "@lib/minecraft/fetch-minecraft-user";
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

  const userProfile = await fetchMinecraftUser(minecraftName);

  const minecraftSkinSum = userProfile ? digestSkinHex(userProfile.textures.raw.value) : "null";
  const minecraftUuid = userProfile ? userProfile.uuid : "null";


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
