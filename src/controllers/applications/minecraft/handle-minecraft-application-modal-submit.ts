import {config} from "@config";
import {extractEmbedFields} from "@lib/discord/extract-fields";
import {fetchMinecraftUser} from "@lib/minecraft/fetch-minecraft-user";
import {digestSkinHex} from "@lib/skin-id/skin-id";
import {logger} from "@logger";
import {MinecraftApplicationModel} from "@models/application/application";
import {MinecraftApplicationDecisionMessageOptions} from "@views/application/minecraft-application-decision-message";
import {ChannelType, ComponentType, ModalSubmitInteraction} from "discord.js";
import z from "zod";
import {MinecraftApplication} from "./application";
const {APPLICATIONS_CHANNEL_ID} = config;

export const handleMinecraftApplicationModalSubmit = async (interaction: ModalSubmitInteraction) => {
    if (!interaction.message) {
        logger.discord("error", "received button interaction from ghost message");
        return;
    }

    let age = interaction.fields.getField("age", ComponentType.TextInput).value;
    const reason = interaction.fields.getField("reason", ComponentType.TextInput).value;
    const minecraftName = interaction.fields.getField("minecraftName", ComponentType.TextInput).value;

    if (!age || !reason || !minecraftName) {
        interaction.reply("You must provide a valid age, reason, and minecraft name!").catch(logger.error);
        return;
    }

    const applicationDecisionChannel = interaction.client.channels.cache.get(APPLICATIONS_CHANNEL_ID);

    if (!applicationDecisionChannel || applicationDecisionChannel.type !== ChannelType.GuildText) {
        logger.discord(
            "error",
            `Could not find log channel with id ${APPLICATIONS_CHANNEL_ID} to log application submission`,
        );
        return;
    }

    const userProfile = await fetchMinecraftUser(minecraftName);
    const minecraftSkinSum = userProfile ? digestSkinHex(userProfile.textures?.raw.value) : "null";
    const minecraftUuid = userProfile ? userProfile.uuid : "null";

    const embedFieldSchema = z.object({
        serverId: z.string(),
        roleId: z.string(),
    });

    const embedFields = extractEmbedFields<typeof embedFieldSchema._type>(
        interaction.message.embeds[0],
        embedFieldSchema,
    );
    if (!embedFields) {
        logger.discord("error", "message embed does not contain a server id, deleting.");
        interaction.message?.delete().catch(logger.error);
        interaction.reply({
            ephemeral: true,
            content: "internal server error",
        });
        return;
    }
    const {serverId, roleId} = embedFields;

    const applicationOptions: MinecraftApplicationModel = {
        discordId: interaction.user.id,
        age,
        reason,
        minecraftName,
        minecraftUuid,
        minecraftSkinSum,
        serverId,
        roleId,
        createdAt: new Date(Date.now()),
    };

    const application = new MinecraftApplication({
        ...applicationOptions,
        client: interaction.client,
    });

    const autoReviewResult = await application.autoReviewResult().catch(logger.error);
    if (!autoReviewResult) return;

    const message = await applicationDecisionChannel
        .send(MinecraftApplicationDecisionMessageOptions(application.getOptions(), autoReviewResult))
        .catch((err) => logger.error(err));
    if (!message) return;

    await interaction
        .reply({
            content: "Your application has been submitted. Applications can take up to three days to review.",
            ephemeral: true,
        })
        .catch(logger.error);
};
