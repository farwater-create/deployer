import {FarwaterUser} from "@controllers/users/farwater-user";
import {fetchMinecraftUser} from "@lib/minecraft/fetch-minecraft-user";
import {digestSkinHex} from "@lib/skin-id/skin-id";
import {logger} from "@logger";
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
        const userId = interaction.options.get("user", true).user?.id as string;
        const minecraft = interaction.options.get("minecraft", true).value as string;

        const discordUser = await FarwaterUser.fromDiscordId(interaction.client, userId);
        const minecraftUser = await FarwaterUser.fromMinecraftName(interaction.client, minecraft);

        if (!minecraftUser) {
            if (discordUser.getOptions().minecraftName !== null) {
                return interaction.reply({
                    content: `Minecraft account **${
                        discordUser.getOptions().minecraftName
                    }** is already linked to <@${userId}>. Run \`/unlink\` to unlink it.`,
                });
            }

            const userProfile = await fetchMinecraftUser(minecraft);
            const minecraftSkinSum = userProfile ? digestSkinHex(userProfile.textures?.raw.value) : "null";
            const minecraftUuid = userProfile ? userProfile.uuid : "null";

            discordUser.getOptions().minecraftName = minecraft;
            discordUser.getOptions().minecraftSkinSum = minecraftSkinSum;
            discordUser.getOptions().minecraftUuid = minecraftUuid;

            return await discordUser
                .serialize()
                .then(() =>
                    interaction.reply({
                        content: `Linked Minecraft account **${minecraft}** to <@${userId}>.`,
                    }),
                )
                .catch((e) => {
                    logger.discord("error", `Failed to link Minecraft account ${minecraft} to ${userId}. ${e}`);
                    return interaction.reply({
                        ephemeral: true,
                        content: `Failed to link Minecraft account **${minecraft}** to <@${userId}>.`,
                    });
                });
        } else {
            return interaction.reply({
                content: `Minecraft account **${minecraft}** is already linked to <@${
                    minecraftUser.getOptions().discordId
                }>. Run \`/unlink\` to unlink it.`,
            });
        }
    },
};
