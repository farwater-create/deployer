import { Client } from "discord.js";
import { config } from "../lib/config";
import logger from "../lib/logger";

export default async (client: Client) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, guild] of client.guilds.cache) {
      if (guild.id != config.DISCORD_GUILD_ID) await guild.leave();
    }
  } catch (error) {
    logger.log(error);
  }

  client.on("guildCreate", async (guild) => {
    if (guild.id != config.DISCORD_GUILD_ID)
      try {
        await guild.leave();
      } catch (error) {
        logger.log(error);
      }
  });
};
