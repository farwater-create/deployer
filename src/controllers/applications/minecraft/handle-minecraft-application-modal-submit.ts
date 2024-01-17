import {config} from "@config";
import {FarwaterUser} from "@controllers/users/farwater-user";
import {extractEmbedFields} from "@lib/discord/extract-fields";
import {fetchMinecraftUser} from "@lib/minecraft/fetch-minecraft-user";
import {digestSkinHex} from "@lib/skin-id/skin-id";
import {logger} from "@logger";
import {MinecraftApplicationModel, MinecraftApplicationReviewStatus} from "@models/application/application";
import {FarwaterUserModel} from "@models/user/farwater-user";
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

    const age = interaction.fields.getField("age", ComponentType.TextInput).value;
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

    const minecraftUser = await FarwaterUser.fromMinecraftName(interaction.client, minecraftName);

    if (minecraftUser) {
        if (minecraftUser.getOptions().discordId.toString() != interaction.user.id.toString())
            return interaction.reply({
                ephemeral: true,
                content: `Minecraft account **${minecraftName}** is already linked to another Discord account. If you believe this is a mistake, please create a ticket.`,
            });
    }

    const userProfile = await fetchMinecraftUser(minecraftName);
    const minecraftSkinSum = userProfile ? digestSkinHex(userProfile.textures?.raw.value) : "null";
    const minecraftUuid = userProfile ? userProfile.uuid : "null";

    const farwaterUserOptions: FarwaterUserModel = {
        discordId: interaction.user.id,
        age: age.toString(),
        minecraftName,
        minecraftSkinSum,
        minecraftUuid,
        updatedAt: new Date(Date.now()),
        createdAt: new Date(Date.now()),
    };

    const farwaterUser = new FarwaterUser({
        ...farwaterUserOptions,
        client: interaction.client,
    });

    const embedFieldSchema = z.object({
        serverId: z.string(),
        roleId: z.string(),
    });

    const embedFields = extractEmbedFields<typeof embedFieldSchema._type>(
        interaction.message.embeds[0],
        embedFieldSchema,
    );
    if (!embedFields) {
        await farwaterUser.serialize();
        logger.discord("error", "message embed does not contain a server id, deleting.");
        interaction.message?.delete().catch(logger.error);
        interaction.reply({
            ephemeral: true,
            content: "internal server error",
        });
        return;
    }

    const {serverId, roleId} = embedFields;

    const existingApplication = await farwaterUser.getMinecraftApplicationByServerId(serverId);
    const existingAppFarwaterUser = await existingApplication?.getFarwaterUser();

    await farwaterUser.serialize();

    if (
        existingApplication &&
        existingApplication.getOptions().status == MinecraftApplicationReviewStatus.Pending &&
        existingAppFarwaterUser?.getOptions().minecraftName != null
    ) {
        logger.discord(
            "warn",
            `user @<${interaction.user.id}> already has a pending application for server ${serverId}\n
            old minecraft: ${existingAppFarwaterUser?.getOptions().minecraftName}\n
            new minecraft: ${minecraftName}`,
        );
        return interaction.reply({
            ephemeral: true,
            content: `You already have a pending application for server ${serverId}. Please give us some time to review your application.`,
        });
    }

    const applicationOptions: MinecraftApplicationModel = {
        discordId: interaction.user.id,
        reason,
        serverId,
        roleId,
        status: MinecraftApplicationReviewStatus.Pending,
        createdAt: new Date(Date.now()),
    };

    const application = new MinecraftApplication({
        ...applicationOptions,
        client: interaction.client,
    });

    await application.serialize();

    const autoReviewResult = await application.autoReviewResult().catch(logger.error);
    if (!autoReviewResult) return;

    const message = await applicationDecisionChannel
        .send(
            MinecraftApplicationDecisionMessageOptions(
                application.getOptions(),
                farwaterUser.getOptions(),
                autoReviewResult,
            ),
        )
        .catch((err) => logger.error(err));
    if (!message) return;

    await interaction
        .reply({
            content: "Your application has been submitted. Applications can take up to three days to review.",
            ephemeral: true,
        })
        .catch(logger.error);
};
