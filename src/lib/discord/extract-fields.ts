import { Embed } from "discord.js"
import { ZodSchema } from "zod"

type StringObject = {
  [key: string]: string
};

export const extractEmbedFields = <T>(embed: Embed, fields: ZodSchema): T => {
  const f: StringObject  = {};
  embed.fields.forEach(field => {
    f[field.name] = field.value;
  });
  const result = fields.parse(f);
  return result as T;
}
