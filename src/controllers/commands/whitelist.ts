import { FarwaterUser } from "@controllers/users/farwater-user";
import { logger } from "@logger";
import { ContextCommand } from "@models/command";
import { ApplicationCommandType, ContextMenuCommandBuilder, PermissionsBitField } from "discord.js";

export const whitelist: ContextCommand = {
    json: new ContextMenuCommandBuilder()
        .setName("whitelist")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
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
        const farwaterUser = await FarwaterUser.fromDiscordId(interaction.client, user.id);
        const applications = await farwaterUser.getMinecraftApplications();
        if (!applications) return;
        for (const application of applications) {
            farwaterUser.whitelist(application.getOptions().serverId).catch(logger.error);
        }
    },
};
