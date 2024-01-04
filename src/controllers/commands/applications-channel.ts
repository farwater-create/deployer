import {Command} from "@models/command";
import {MinecraftApplicationStartMessageOptions} from "@views/application/minecraft-application-start-message";
import {PermissionsBitField, SlashCommandBuilder} from "discord.js";

export const applicationsChannelCommand: Command = {
    json: new SlashCommandBuilder()
        .setName("applications-channel")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
        .setDescription("Creates the initial application message.")
        .addStringOption((o) => o.setName("server").setRequired(true).setDescription("deployer server id"))
        .addRoleOption((r) =>
            r.setName("grant").setRequired(true).setDescription("role to grant on application accept"),
        )
        .toJSON(),
    handler: (interaction) => {
        const serverId = interaction.options.get("server", true).value as string;
        const roleId = interaction.options.get("grant", true).value as string;
        interaction.channel?.send(MinecraftApplicationStartMessageOptions(serverId, roleId));
        interaction.reply({
            ephemeral: true,
            content: "created application message",
        });
    },
};
