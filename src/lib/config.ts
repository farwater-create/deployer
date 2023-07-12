import z from "zod";
import dotenv from "dotenv";
dotenv.config();

const schema = z.object({
  BOT_TOKEN: z.string().nonempty(),
  CLIENT_ID: z.string().nonempty(),
  GUILD_ID: z.string().nonempty(),
  LOG_LEVEL: z.string().nonempty().default("info"),
  LOG_CHANNEL_ID: z.string().nonempty(),
});

const rawConfig = schema.safeParse(process.env);

if (rawConfig.success === false) {
  console.error(
    "❌ Invalid environment variables:",
    rawConfig.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const config = rawConfig.data;
