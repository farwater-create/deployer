import { createApplicationStartMessage } from "@controllers/commands/create-application-message";
import { Message } from "discord.js";

export type CommandHandler = (
  message: Message,
  args: Array<string>,
) => Promise<void>;

export const commands = new Map<string, CommandHandler>();
commands.set("create-application-message", createApplicationStartMessage);

const PREFIX = "!";

export const commandHandler = async (message: Message) => {
  if (message.author.bot) return;
  message.content = message.content.trim();
  if (!message.content.startsWith(PREFIX)) return;
  const args = message.content.split(" ");
  const command = args.shift()?.toLowerCase().slice(PREFIX.length);
  if (!command) return;
  const handler = commands.get(command);
  if (!handler) return;
  try {
    await handler(message, args);
  } catch (error) {
    console.error(error);
  }
};
