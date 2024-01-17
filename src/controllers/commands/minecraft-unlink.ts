import {FarwaterUser} from "@controllers/users/farwater-user";
import {prisma} from "@lib/prisma";
import {logger} from "@logger";
import {Command} from "@models/command";
import {PermissionsBitField, SlashCommandBuilder} from "discord.js";

export const unlinkMinecraftCommand: Command = {
    json: new SlashCommandBuilder()
        .setName("unlink")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
        .setDescription("Unlink a Minecraft account from a Discord user.")
        .addUserOption((o) => o.setName("user").setDescription("discord user"))
        .addStringOption((o) => o.setName("minecraft").setDescription("minecraft username"))
        .toJSON(),
    handler: async (interaction) => {
        const userId = interaction.options.get("user")?.user?.id as string | null;
        const minecraft = interaction.options.get("minecraft")?.value as string | null;

        let minecraftUsers, discordUser;

        if (minecraft != null) {
            minecraftUsers = await prisma.farwaterUser.findMany({
                where: {
                    minecraftName: minecraft,
                },
            });

            if (!minecraftUsers) {
                return interaction.reply({
                    content: `Minecraft account **${minecraft}** is not linked to a Discord account.`,
                });
            }
        }

        if (userId != null) {
            discordUser = await FarwaterUser.fromDiscordId(interaction.client, userId);
            if (!discordUser) {
                return interaction.reply({
                    content: `Discord account <@${userId}> is not linked to Minecraft.`,
                });
            }
        }

        if (userId && discordUser) {
            discordUser.getOptions().minecraftName = null;
            discordUser.getOptions().minecraftSkinSum = null;
            discordUser.getOptions().minecraftUuid = null;

            return await discordUser
                .serialize()
                .then(() =>
                    interaction.reply({
                        content: `Successfully unlinked Discord account <@${userId}> from Minecraft .`,
                    }),
                )
                .catch((e) => {
                    logger.discord("error", `Failed to unlink Discord account. ${e}`);
                    return interaction.reply({
                        ephemeral: true,
                        content: `Failed to unlink Discord account.`,
                    });
                });
        }

        if (minecraftUsers) {
            const discordMentions = minecraftUsers.map((user) => `<@${user.discordId}>`).join(", ");
            return await prisma.farwaterUser
                .updateMany({
                    where: {
                        discordId: {
                            in: minecraftUsers.map((user) => user.discordId),
                        },
                    },
                    data: {
                        minecraftUuid: null,
                        minecraftName: null,
                        minecraftSkinSum: null,
                        updatedAt: new Date(Date.now()),
                    },
                })
                .then(() => {
                    interaction.reply({
                        content: `Successfully unlinked ${discordMentions} from Minecraft account **${minecraft}**.`,
                    });
                })
                .catch((e) => {
                    logger.discord("error", `Failed to unlink Minecraft account. ${e}`);
                    return interaction.reply({
                        ephemeral: true,
                        content: `Failed to unlink Minecraft account.`,
                    });
                });
        }

        return interaction.reply({
            ephemeral: true,
            content: `What? You need to choose at least one.`,
        });
    },
};
