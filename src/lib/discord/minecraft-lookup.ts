import {prisma} from "@lib/prisma";
import {FarwaterUser} from "@prisma/client";

export const lookupLink = async (
    identifier: string,
    lookupType: "minecraftToDiscord" | "discordToMinecraft",
): Promise<FarwaterUser[] | null> => {
    const whereCondition = lookupType === "minecraftToDiscord" ? {minecraftName: identifier} : {discordId: identifier};

    const discordUsers = await prisma.farwaterUser.findMany({
        where: whereCondition,
    });

    if (!discordUsers) return null;
    return discordUsers;
};
