import { Message } from "discord.js";
import { commandHandler } from "@commands/command-handler";
import { config } from "@config";
import { logger } from "@logger";

export const messageCreate = async (message: Message) => {
  if(message.guild?.id != config.GUILD_ID) {
    logger.warn(`Received message from uknown guild: ${message.guild?.toJSON()}`);
    return
  }
  await commandHandler(message);
};
