import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalSubmitInteraction, TextChannel, ChannelType } from "discord.js";
import { config } from "@config";
import { FarwaterUser } from "@controllers/users/farwater-user";
import { extractEmbedFields } from "@lib/discord/extract-fields";
import { fetchMinecraftUser } from "@lib/minecraft/fetch-minecraft-user";
import { digestSkinHex } from "@lib/skin-id/skin-id";
import { logger } from "@logger";
import { MinecraftApplicationReviewStatus } from "@models/application/application";
import { FarwaterUserModel } from "@models/user/farwater-user";
import { MinecraftApplicationDecisionMessageOptions } from "@views/application/minecraft-application-decision-message";
import z from "zod";
import { MinecraftApplication } from "@controllers/applications/minecraft/application";

const { APPLICATIONS_CHANNEL_ID } = config;

export async function handleMinecraftApplicationModalSubmit(interaction: ModalSubmitInteraction) {
    if (!interaction.message) {
        logger.discord("error", "Received button interaction from ghost message");
        return;
    }

    const minecraftName = interaction.fields.getTextInputValue("minecraftName");
    const age = interaction.fields.getTextInputValue("age");

    if (!minecraftName || !age) {
        return await interaction.reply("You must provide a valid Minecraft name and age!").catch(logger.error);
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

    const embed = new EmbedBuilder().setTitle("Is this you?").addFields([
        {
            name: "Username",
            value: userProfile ? userProfile.username : "Not found",
        },
    ]);

    const thumbnail = new URL(`https://mc-heads.net/head/${userProfile ? userProfile.username : "Not found"}.png`);
    const image = new URL(`https://mc-heads.net/body/${userProfile ? userProfile.username : "Not found"}.png`);

    embed.setImage(image.toString());
    embed.setThumbnail(thumbnail.toString());

    const buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('That is me!')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger),
        );

    const confirmMessage = await interaction.reply({
        ephemeral: true,
        embeds: [embed],
        components: [buttons],
    });

    const filter = (i: any) => ['confirm', 'cancel'].includes(i.customId) && i.user.id === interaction.user.id;
    const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 60000 });

    collector?.on('collect', async i => {
        if (i.customId === 'confirm') {
            await confirmMessage.delete().catch(logger.error);

            const farwaterUserOptions: FarwaterUserModel = {
                discordId: interaction.user.id,
                age,
                minecraftName: userProfile.username,
                minecraftSkinSum: digestSkinHex(userProfile.textures?.raw.value),
                minecraftUuid: userProfile.uuid,
                updatedAt: new Date(),
                createdAt: new Date(),
            };

            const farwaterUser = new FarwaterUser({ ...farwaterUserOptions, client: interaction.client });
            await farwaterUser.serialize();

            const embedFieldSchema = z.object({ serverId: z.string(), roleId: z.string() });

            if (!interaction?.message?.embeds[0]) {
                logger.discord("error", "Message does not contain an embed");
                await interaction.reply({ ephemeral: true, content: "Internal server error" });
                return;
            }

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

            await interaction.followUp({
                content: "Your application has been submitted. Applications can take up to three days to review.",
                ephemeral: true,
            }).catch(logger.error);
        } else if (i.customId === 'cancel') {
            await i.update({ content: 'Please click apply again. Make sure to double-check your Minecraft username.', components: [], embeds: [] });
        }
    });

    collector?.on('end', collected => {
        if (collected.size === 0) {
            interaction.editReply({ content: "Time expired. Please try the process again.", components: [], embeds: [] });
        }
    });
}
