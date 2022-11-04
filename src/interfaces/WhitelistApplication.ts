import { z } from "zod";
export const whitelistApplicationSchema = z.object({
  age: z.string(),
  reason: z.string(),
  minecraftUUID: z.string(),
  discordID: z.string(),
  discordUsername: z.string(),
});

export type WhitelistApplication = typeof whitelistApplicationSchema._type;
