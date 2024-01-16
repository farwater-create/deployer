import {prisma} from "@lib/prisma";
import {FarwaterUser} from "@prisma/client";

export const lookupLink = async (
    identifier: string,
    lookupType: "minecraftToDiscord" | "discordToMinecraft",
): Promise<FarwaterUser | null> => {
    const whereCondition = lookupType === "minecraftToDiscord" ? {minecraftName: identifier} : {discordId: identifier};

    const discordUser = await prisma.farwaterUser.findFirst({
        where: whereCondition,
    });

    if (!discordUser) return null;
    return discordUser;
};
