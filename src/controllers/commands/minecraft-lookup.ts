import {lookupLink} from "@lib/discord/lookup-minecraft";
import {Command} from "@models/command";
import {EmbedBuilder, PermissionsBitField, SlashCommandBuilder} from "discord.js";

export const lookupLinkCommand: Command = {
    json: new SlashCommandBuilder()
        .setName("lookup")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
        .setDescription("Look up a Minecraft or Discord account link.")
        .addUserOption((o) => o.setName("user").setRequired(false).setDescription("discord user"))
        .addStringOption((o) => o.setName("minecraft").setRequired(false).setDescription("minecraft username"))
        .toJSON(),
    handler: async (interaction) => {
        const minecraft = interaction.options.get("minecraft", false)?.value as string;
        const userId = interaction.options.get("user", false)?.user?.id;

        const result = await lookupLink(
            userId ? userId : minecraft,
            userId ? "discordToMinecraft" : "minecraftToDiscord",
        );

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
            `https://mc-heads.net/body/${
                result && result[0]?.minecraftName ? result[0]?.minecraftName : "Not found"
            }.png`,
        );
        const image = new URL(
            `https://mc-heads.net/body/${
                result && result[0]?.minecraftName ? result[0]?.minecraftName : "Not found"
            }.png`,
        );
        embed.setImage(image.toString());
        embed.setThumbnail(thumbnail.toString());

        await interaction.reply({
            ephemeral: true,
            embeds: [embed],
            content: result ? "" : `No link found for ${userId ? `<@${userId}>` : minecraft}.`,
        });
    },
};
