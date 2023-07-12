import { Client } from "discord.js";
import { config } from "@config";
import { logger } from "@logger";
/**
 * Prints bot user tag to console
 * @param client
 */
export const helloWorld = async (client: Client) => {
  const user = await client.users.fetch(config.CLIENT_ID);
  if (!user)
    throw new Error(
      `User with ID ${config.CLIENT_ID} not found! (Did you invite the bot to your server?)`,
    );
  logger.info(`✅ Bot is logged in as ${user.tag}!`);
};
