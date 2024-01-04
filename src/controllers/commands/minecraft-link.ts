import {linkDiscordUserToMinecraft} from "@lib/discord/link-minecraft";
import {Command} from "@models/command";
import {PermissionsBitField, SlashCommandBuilder} from "discord.js";

export const linkMinecraftCommand: Command = {
    json: new SlashCommandBuilder()
        .setName("link")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
        .setDescription("Links a Discord user to a Minecraft account.")
        .addUserOption((o) => o.setName("user").setRequired(true).setDescription("discord user"))
        .addStringOption((o) => o.setName("minecraft").setRequired(true).setDescription("minecraft username"))
        .toJSON(),
    handler: async (interaction) => {
        const user = interaction.options.get("user", true).user?.id as string;
        const minecraft = interaction.options.get("minecraft", true).value as string;
        await linkDiscordUserToMinecraft(user, minecraft)
            .catch((e) => {
                interaction.reply({
                    ephemeral: true,
                    content: "Failed to link Minecraft account. " + e,
                });
            })
            .then(() => {
                interaction.reply({
                    ephemeral: true,
                    content: `Successfully linked <@${user}> to ${minecraft}.`,
                });
            });
    },
};
