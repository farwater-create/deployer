import { lookupLink } from "@lib/discord/minecraft-lookup";
import { Command, ContextCommand } from "@models/command";
import { ApplicationCommandType, ContextMenuCommandBuilder, EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from "discord.js";

export const lookupLinkCommand: Command = {
    json: new SlashCommandBuilder()
        .setName("lookup")
        .setDescription("Look up a Minecraft or Discord account link.")
        .addUserOption((o) => o.setName("user").setRequired(false).setDescription("discord user"))
        .addStringOption((o) => o.setName("minecraft").setRequired(false).setDescription("minecraft username"))
        .toJSON(),
    handler: async (interaction) => {
        const minecraft = interaction.options.get("minecraft", false)?.value as string;
        let userId = interaction.options.get("user", false)?.user?.id;

        if (!minecraft && !userId) userId = interaction.user.id;

        const result = await lookupLink(
            userId ? userId : minecraft,
            userId ? "discordToMinecraft" : "minecraftToDiscord",
        );

        if (result && result.length > 0) {
            const embed = new EmbedBuilder().setTitle("Minecraft Lookup").addFields([
                {
                    name: "Discord",
                    value: result ? result.map((r) => `<@${r.discordId}>`).join(", ") : "Not found",
                },
                {
                    name: "Minecraft",
                    value: result && result[0]?.minecraftName ? result[0]?.minecraftName : "Not found",
                },
                {
                    name: "UUID",
                    value: result && result[0]?.minecraftUuid ? result[0]?.minecraftUuid : "Not found",
                },
            ]);

            const thumbnail = new URL(
                `https://mc-heads.net/head/${result && result[0]?.minecraftName ? result[0].minecraftName : "Not found"
                }.png`,
            );

            const image = new URL(
                `https://mc-heads.net/body/${result && result[0]?.minecraftName ? result[0].minecraftName : "Not found"
                }.png`,
            );

            embed.setImage(image.toString());
            embed.setThumbnail(thumbnail.toString());

            return await interaction.reply({
                embeds: [embed],
            });
        }

        return await interaction.reply({
            ephemeral: true,
            content: `No link found for ${userId ? `<@${userId}>` : minecraft}.`,
        });
    },
};

export const lookupLinkApp: ContextCommand = {
    json: new ContextMenuCommandBuilder()
        .setName("lookup")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .setType(ApplicationCommandType.User),
    handler: async (interaction) => {
        if (!interaction.isUserContextMenuCommand()) return;
        const userId = interaction.options.get("user", false)?.user?.id as string;

        const result = await lookupLink(
            userId,
            "discordToMinecraft",
        );

        if (result && result.length > 0) {
            const embed = new EmbedBuilder().setTitle("Minecraft Lookup").addFields([
                {
                    name: "Discord",
                    value: result ? result.map((r) => `<@${r.discordId}>`).join(", ") : "Not found",
                },
                {
                    name: "Minecraft",
                    value: result && result[0]?.minecraftName ? result[0]?.minecraftName : "Not found",
                },
                {
                    name: "UUID",
                    value: result && result[0]?.minecraftUuid ? result[0]?.minecraftUuid : "Not found",
                },
            ]);

            const thumbnail = new URL(
                `https://mc-heads.net/head/${result && result[0]?.minecraftName ? result[0].minecraftName : "Not found"
                }.png`,
            );

            const image = new URL(
                `https://mc-heads.net/body/${result && result[0]?.minecraftName ? result[0].minecraftName : "Not found"
                }.png`,
            );

            embed.setImage(image.toString());
            embed.setThumbnail(thumbnail.toString());

            return await interaction.reply({
                embeds: [embed],
            });
        }

        return await interaction.reply({
            ephemeral: true,
            content: `No link found for <@${userId}>.`,
        });
    },
};
