import { messageHasRoleMiddleware } from "@controllers/message-middleware/has-role";
import { ApplicationStartMessage } from "@views/application/application-start-message";
import {
  Message,
} from "discord.js";
import { config } from "@config";

export const createApplicationStartMessage = async (message: Message) => {
  if(!messageHasRoleMiddleware(message, config.ADMIN_ROLE_ID).next) {
    return;
  }

  const channel = message.channel;
  channel.send(ApplicationStartMessage);
  await message.delete();
};
