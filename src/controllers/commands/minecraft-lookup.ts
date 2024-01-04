import {lookupLink} from "@lib/discord/lookup-minecraft";
import {Command} from "@models/command";
import {EmbedBuilder, PermissionsBitField, SlashCommandBuilder} from "discord.js";

export const lookupLinkCommand: Command = {
    json: new SlashCommandBuilder()
        .setName("lookup")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
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
                value: result?.discordId ? `<@${result.discordId}>` : "Not found",
            },
            {
                name: "Minecraft",
                value: result?.minecraftName ?? "Not found",
            },
            {
                name: "UUID",
                value: result?.minecraftUuid ?? "Not found",
            },
        ]);
        const thumbnail = new URL(`https://mc-heads.net/body/${result?.minecraftName}.png`);
        const image = new URL(`https://mc-heads.net/body/${result?.minecraftName}.png`);
        embed.setImage(image.toString());
        embed.setThumbnail(thumbnail.toString());

        interaction.reply({
            ephemeral: true,
            embeds: [embed],
            content: result ? "" : `No link found for ${userId ? `<@${userId}>` : minecraft}.`,
        });
    },
};
