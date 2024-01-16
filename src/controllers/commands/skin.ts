import {logger} from "@logger";
import {ApplicationCommandType, ContextMenuCommandBuilder, EmbedBuilder, PermissionsBitField} from "discord.js";

import {FarwaterUser} from "@controllers/users/farwater-user";
import {ContextCommand} from "@models/command";
export const skin: ContextCommand = {
    json: new ContextMenuCommandBuilder()
        .setName("skins")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .setType(ApplicationCommandType.User),
    handler: async (interaction) => {
        if (!interaction.isUserContextMenuCommand()) return;
        const user = interaction.targetUser;
        const farwaterUser = await FarwaterUser.fromDiscordId(interaction.client, user.id).catch(logger.error);
        if (!farwaterUser) {
            await interaction.reply({
                ephemeral: true,
                content: "user not found",
            });
            return;
        }
        const skinURL = await farwaterUser.skinURL();
        const description = skinURL;
        await interaction.reply({
            ephemeral: true,
            embeds: [new EmbedBuilder().setDescription(description)],
        });
    },
};
