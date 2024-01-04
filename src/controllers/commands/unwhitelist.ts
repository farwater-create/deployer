import {MinecraftApplication} from "@controllers/applications/minecraft/application";
import {logger} from "@logger";
import {ApplicationCommandType, ContextMenuCommandBuilder, PermissionsBitField} from "discord.js";

import {ContextCommand} from "@models/command";
export const unwhitelist: ContextCommand = {
    json: new ContextMenuCommandBuilder()
        .setName("unwhitelist")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .setType(ApplicationCommandType.User),
    handler: async (interaction) => {
        if (!interaction.isUserContextMenuCommand()) return;
        const user = interaction.targetUser;
        const member = await interaction.guild?.members.fetch(user.id).catch(logger.error);

        logger.discord("info", interaction.user.username + " unwhitelisted " + interaction.targetUser?.displayName);

        if (!member) {
            await interaction
                .reply({
                    ephemeral: true,
                    content: "could not fetch member?",
                })
                .catch(logger.error);
            return;
        }
        await interaction
            .reply({
                ephemeral: true,
                content: "Unwhitelisted minecraft user for " + member.displayName + " on all farwater applications",
            })
            .catch(logger.error);
        if (!member) return;
        const applications = await MinecraftApplication.fromDiscordId(interaction.client, user.id).catch(logger.error);
        if (!applications) return;
        for (const application of applications) {
            application.unwhitelist().catch(logger.error);
        }
    },
};
