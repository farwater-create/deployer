import { messageHasRole } from "@lib/discord-helpers/has-role";
import { Message } from "discord.js";
export const messageHasRoleMiddleware = (message: Message, role: string) => {
  const hasRole = messageHasRole(message, role);
  if (!hasRole) {
    message.reply("You don't have permission to do that.");
  }
  return {
    next: hasRole,
  };
};
