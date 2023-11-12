import z from "zod";
import dotenv from "dotenv";
dotenv.config();

const schema = z.object({
  BOT_TOKEN: z.string().nonempty(),
  CLIENT_ID: z.string().nonempty(),
  GUILD_ID: z.string().nonempty(),
  LOG_LEVEL: z.string().nonempty().default("info"),
  LOG_CHANNEL_ID: z.string().nonempty(),
  ADMIN_ROLE_ID: z.string().nonempty(),
  APPLICATIONS_CHANNEL_ID: z.string().nonempty(),
  WHITELIST_NOTIFICATIONS_CHANNEL_ID: z.string().nonempty(),
  PTERODACTYL_API_KEY: z.string().nonempty(),
  PTERODACTYL_API_URL: z.string().nonempty(),
  RULES_CHANNEL_ID: z.string().nonempty(),
  BOT_USER_ID: z.string().nonempty(),
  PTERODACTYL_SERVER_ID: z.string().nonempty(),
  GRANT_ROLE_ID: z.string().nonempty(),
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
