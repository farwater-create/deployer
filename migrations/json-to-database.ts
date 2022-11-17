/* eslint-disable unicorn/prefer-top-level-await */
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";
import z from "zod";
const client = new PrismaClient();

const whitelistSchema = z.array(
  z.object({
    id: z.string(),
    age: z.number(),
    reason: z.string(),
    minecraftUUID: z.string(),
    discordID: z.string(),
    status: z.string(),
  })
);

async function main() {
  const whitelistJSON = fs.readFileSync("userdata.json", { encoding: "utf8" });
  const whitelist = whitelistSchema.parse(JSON.parse(whitelistJSON));
  for (const entry of whitelist) {
    try {
      await client.whitelistApplication.create({
        data: entry,
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (error["code"] && error.code !== "P2002") console.error(error);
    }
  }
}

main();
