import {fetchMinecraftUser} from "@lib/minecraft/fetch-minecraft-user";
import {prisma} from "@lib/prisma";
import {logger} from "@logger";

export const linkDiscordUserToMinecraft = async (discordId: string, minecraftIdentifier: string) => {
    const minecraftUser = await fetchMinecraftUser(minecraftIdentifier);

    if (!minecraftUser) {
        logger.error("Failed to link DiscordUser to Minecraft account. Minecraft user not found.");
        return;
    }

    try {
        const existingLink = await prisma.farwaterUser.findUnique({
            where: {
                discordId: discordId,
            },
        });

        if (existingLink) {
            await prisma.farwaterUser.update({
                where: {
                    discordId: discordId,
                },
                data: {
                    minecraftUuid: minecraftUser.uuid,
                    minecraftName: minecraftUser.username,
                },
            });

            logger.discord(
                "info",
                `Successfully updated link for <@${discordId}> from ${existingLink.minecraftName} to ${minecraftUser.username}`,
            );
        } else {
            await prisma.farwaterUser.create({
                data: {
                    discordId,
                    minecraftUuid: minecraftUser.uuid,
                    minecraftName: minecraftUser.username,
                },
            });

            logger.discord(
                "info",
                `Successfully linked <@${discordId}> to Minecraft account ${minecraftUser.username}`,
            );
        }
    } catch (error) {
        logger.error(`Failed to link Discord user to Minecraft account: ${error}`);
    }
};
