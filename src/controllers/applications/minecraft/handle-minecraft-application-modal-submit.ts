import { logger } from "@logger";
import { MinecraftApplicationDecisionMessageOptions } from "@views/application/minecraft-application-decision-message";
import { ComponentType, ChannelType, ModalSubmitInteraction } from "discord.js";
import { config } from "@config";
import { MinecraftApplicationModalEvent } from "views/application/minecraft-application-submit-modal";
import { digestSkinHex } from "@lib/skin-id/skin-id";
import { MinecraftApplication } from "./application";
import { fetchMinecraftUser } from "@lib/minecraft/fetch-minecraft-user";
import z from "zod";
import { extractEmbedFields } from "@lib/discord-helpers/extract-fields";
import { MinecraftApplicationModel } from "@models/application/application";
const { APPLICATIONS_CHANNEL_ID } = config;

export const handleMinecraftApplicationModalSubmit = async (
  interaction: ModalSubmitInteraction,
) => {
  if (interaction.customId !== MinecraftApplicationModalEvent.Submit) return;
  if (!interaction.message) {
    logger.discord("error", "received button interaction from ghost message");
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

  const embedFieldSchema = z.object({
    serverId: z.string()
  });

  const embedFields = extractEmbedFields<typeof embedFieldSchema._type>(interaction.message.embeds[0], embedFieldSchema);
  if(!embedFields) {
    logger.discord(
      "error",
      "message embed does not contain a server id, deleting."
    );
    interaction.message?.delete().catch(logger.error);
    interaction.reply({
      ephemeral: true,
      content: "internal server error"
    });
    return;
  }
  const { serverId } = embedFields;


  const applicationOptions: MinecraftApplicationModel = {
    discordId: interaction.user.id,
    age,
    reason,
    minecraftName,
    minecraftUuid,
    minecraftSkinSum,
    serverId,
    createdAt: new Date(Date.now())
  };

  const application = new MinecraftApplication(applicationOptions, interaction.client);

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
