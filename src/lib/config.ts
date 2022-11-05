import dotenv from "dotenv";
dotenv.config();
const assertEnv = (key: string, defaultValue?: string) => {
  const value = process.env[key] ? process.env[key] : defaultValue;
  if (!value) {
    throw new Error(`${key} is undefined`);
  }
  return value;
};

export const config = {
  DISCORD_TOKEN: assertEnv("DISCORD_TOKEN"),
  PTERO_TOKEN: assertEnv("PTERO_TOKEN"),
  PTERO_SERVER_ID: assertEnv("PTERO_SERVER_ID"),
  PTERO_SERVER: assertEnv("PTERO_SERVER"),
  APPLICATION_PENDING_CHANNEL: assertEnv(
    "APPLICATION_PENDING_CHANNEL",
    "1013541292300582922"
  ),
  DISCORD_CLIENT_ID: assertEnv("DISCORD_CLIENT_ID"),
  DISCORD_GUILD_ID: assertEnv("DISCORD_GUILD_ID", "638990243587948555"),
  APPLICATION_LOG_CHANNEL: assertEnv(
    "APPLICATION_LOG_CHANNEL",
    "1013558339227099236"
  ),
};

export type Config = typeof config;
