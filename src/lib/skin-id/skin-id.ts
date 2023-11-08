import axios from "axios";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "@lib/prisma";
import { logger } from "@logger";

// Define the schema
const UserSessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  properties: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    })
  ),
  profileActions: z.array(z.object({})),
});

export const getSkin = async (uuid: string): Promise<string | undefined> => {
  const url = new URL(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}/`)
  const resp = await axios.get(url.toString());
  const parsedData = UserSessionSchema.parse(resp.data);
  const skin = parsedData.properties.find((v) => v.name === "textures");
  if(!skin) return undefined;
  return skin.value;
}

export const isGoodSkin = async(skin: string) => {
  const hash = crypto.createHash('sha256').update(skin).digest('hex');
  const result = await prisma.badSkin.findFirst({
    where: {
      hash
    }
  });
  console.log(hash);
  console.log(result);
  return result ? false : true;
}

export const addSkinToBadSkinDatabase = async(skin: string) => {
  const hash = crypto.createHash('sha256').update(skin).digest('hex');
  logger.discord("info", "added skin to bad skin database with hash " + hash);
  await prisma.badSkin.upsert({
    where: {
      hash
    },
    update: {},
    create: {
      hash
    }
  });
}
