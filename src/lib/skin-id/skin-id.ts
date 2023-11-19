import axios from "axios";
import { z } from "zod";
import crypto from "node:crypto";

// Define the schema
const UserSessionSchema = z.object({
  uuid: z.string(),
  username: z.string(),
  properties: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    }),
  ),
  profileActions: z.array(z.object({})),
});

export const digestSkinHex = (skin: string | undefined) => {
  if (!skin) return "null";
  return crypto.createHash("sha256").update(skin).digest("hex");
};

export const getSkin = async (uuid: string): Promise<string | undefined> => {
  const url = new URL(`https://api.ashcon.app/mojang/v2/user/${uuid}/`);
  const resp = await axios.get(url.toString());
  const parsedData = UserSessionSchema.parse(resp.data);
  const skin = parsedData.properties.find((v) => v.name === "textures");
  if (!skin) return undefined;
  return skin.value;
};
