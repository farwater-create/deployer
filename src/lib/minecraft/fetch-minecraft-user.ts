import {logger} from "@logger";
import z from "zod";

const usernameHistorySchema = z.object({
    username: z.string(),
});

const skinSchema = z.object({
    url: z.string().optional(),
    data: z.string().optional(),
});

const capeSchema = z.object({
    url: z.string().optional(),
    data: z.string().optional(),
});

const texturesSchema = z.object({
    custom: z.boolean(),
    slim: z.boolean(),
    skin: skinSchema.optional(),
    cape: capeSchema.optional(),
    raw: z.object({
        value: z.string(),
        signature: z.string(),
    }),
});

const userSchema = z.object({
    uuid: z.string(),
    username: z.string(),
    username_history: z.array(usernameHistorySchema),
    textures: texturesSchema,
    created_at: z.string().nullable(),
});

export const fetchMinecraftUser = async (identifier: string) => {
    const resp = await fetch(new URL(`https://api.ashcon.app/mojang/v2/user/${identifier}`).toString()).catch(
        logger.error,
    );
    if (!resp) {
        logger.error("failed to fetch minecraft user " + identifier);
        return;
    }
    const raw = await resp.json();
    return userSchema.parseAsync(raw).catch(logger.error);
};
