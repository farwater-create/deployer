import { config } from "@config";
import { FarwaterUser } from "@controllers/users/farwater-user";
import { extractEmbedFields } from "@lib/discord/extract-fields";
import { fetchMinecraftUser } from "@lib/minecraft/fetch-minecraft-user";
import { digestSkinHex } from "@lib/skin-id/skin-id";
import { logger } from "@logger";
import { MinecraftApplicationReviewStatus } from "@models/application/application";
import { FarwaterUserModel } from "@models/user/farwater-user";
import { MinecraftApplicationDecisionMessageOptions } from "@views/application/minecraft-application-decision-message";
import { ChannelType, ModalSubmitInteraction, TextChannel } from "discord.js";
import z from "zod";
import { MinecraftApplication } from "./application";
const { APPLICATIONS_CHANNEL_ID } = config;

export async function handleMinecraftApplicationModalSubmit(interaction: ModalSubmitInteraction) {
    if (!interaction.message) {
        logger.discord("error", "Received button interaction from ghost message");
        return;
    }

    type FieldInputs = { age: string; reason: string; minecraftName: string };
    const fieldInputs: FieldInputs = ['age', 'reason', 'minecraftName']
        .reduce((acc, fieldName) => ({
            ...acc,
            [fieldName]: interaction.fields.getTextInputValue(fieldName)
        }), {} as FieldInputs);

    const { age, reason, minecraftName } = fieldInputs;

    if (!age || !reason || !minecraftName) {
        return await interaction.reply("You must provide a valid age, reason, and Minecraft name!").catch(logger.error);
    }

    const applicationDecisionChannel = interaction.client.channels.cache.get(APPLICATIONS_CHANNEL_ID) as TextChannel | undefined;
    if (!applicationDecisionChannel || applicationDecisionChannel.type !== ChannelType.GuildText) {
        return logger.discord("error", `Could not find application decision channel with ID ${APPLICATIONS_CHANNEL_ID}`);
    }

    const minecraftUser = await FarwaterUser.fromMinecraftName(interaction.client, minecraftName);
    if (minecraftUser && minecraftUser.getOptions().discordId !== interaction.user.id) {
        return await interaction.reply({
            ephemeral: true,
            content: `Minecraft account **${minecraftName}** is already linked to another Discord account. If you believe this is a mistake, please create a ticket.`,
        });
    }

    const userProfile = await fetchMinecraftUser(minecraftName);
    if (!userProfile) {
        return await interaction.reply({
            ephemeral: true,
            content: `We could not find a Minecraft account with the name **${minecraftName}**. Please double check your Minecraft name as it is case-sensitive. If you continue having issues, please create a ticket.`,
        });
    }

    const farwaterUserOptions: FarwaterUserModel = {
        discordId: interaction.user.id,
        age,
        minecraftName: userProfile ? userProfile.username : minecraftName,
        minecraftSkinSum: userProfile ? digestSkinHex(userProfile.textures?.raw.value) : "null",
        minecraftUuid: userProfile ? userProfile.uuid : "null",
        updatedAt: new Date(),
        createdAt: new Date(),
    };

    const farwaterUser = new FarwaterUser({ ...farwaterUserOptions, client: interaction.client });
    await farwaterUser.serialize();

    const embedFieldSchema = z.object({ serverId: z.string(), roleId: z.string() });
    const embedFields = extractEmbedFields(interaction.message.embeds[0], embedFieldSchema);
    if (!embedFields) {
        logger.discord("error", "Message embed does not contain required fields");
        await interaction.message?.delete().catch(logger.error);
        await interaction.reply({ ephemeral: true, content: "Internal server error" });
        return;
    }

    const { serverId, roleId } = embedFields as { serverId: string, roleId: string };
    const existingApplication = await farwaterUser.getMinecraftApplicationByServerId(serverId);
    if (existingApplication && existingApplication.getOptions().status === MinecraftApplicationReviewStatus.Pending) {
        await interaction.reply({
            ephemeral: true,
            content: `You already have a pending application for server ${serverId}. Please give us some time to review your application.`,
        });
        return;
    }

    const application = new MinecraftApplication({
        discordId: interaction.user.id,
        reason,
        serverId,
        roleId,
        status: MinecraftApplicationReviewStatus.Pending,
        createdAt: new Date(),
        client: interaction.client,
    });
    await application.serialize();

    const autoReviewResult = await application.autoReviewResult().catch(logger.error);
    if (!autoReviewResult) return;

    await applicationDecisionChannel.send(
        MinecraftApplicationDecisionMessageOptions(application.getOptions(), farwaterUser.getOptions(), autoReviewResult)
    ).catch(logger.error);
    await interaction.reply({
        content: "Your application has been submitted. Applications can take up to three days to review.",
        ephemeral: true,
    }).catch(logger.error);
}
