import {prisma} from "@lib/prisma";
import {DiscordUser} from "@prisma/client";

export const lookupLink = async (
    identifier: string,
    lookupType: "minecraftToDiscord" | "discordToMinecraft",
): Promise<DiscordUser | null> => {
    const whereCondition = lookupType === "minecraftToDiscord" ? {minecraftName: identifier} : {discordId: identifier};

    const discordUser = await prisma.discordUser.findFirst({
        where: whereCondition,
    });

    if (!discordUser) return null;
    return discordUser;
};
