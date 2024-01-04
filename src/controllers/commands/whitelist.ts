import {MinecraftApplication} from "@controllers/applications/minecraft/application";
import {logger} from "@logger";
import {ContextCommand} from "@models/command";
import {ApplicationCommandType, ContextMenuCommandBuilder, PermissionsBitField} from "discord.js";

export const whitelist: ContextCommand = {
    json: new ContextMenuCommandBuilder()
        .setName("whitelist")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .setType(ApplicationCommandType.User),
    handler: async (interaction) => {
        if (!interaction.isUserContextMenuCommand()) return;
        const user = interaction.targetUser;
        const member = await interaction.guild?.members.fetch(user.id).catch(logger.error);

        logger.discord("info", interaction.user.username + " whitelisted " + interaction.targetUser?.displayName);

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
                content: "whitelisted minecraft user for " + member.displayName + " on all farwater applications",
            })
            .catch(logger.error);
        const applications = await MinecraftApplication.fromDiscordId(interaction.client, user.id).catch(logger.error);
        if (!applications) return;
        for (const application of applications) {
            application.whitelist();
        }
    },
};
