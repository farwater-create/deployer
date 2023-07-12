import { applicationCommand } from "@commands/applications";
import { Message } from "discord.js";
export type CommandHandler = (message: Message) => Promise<void>;

const PREFIX = "!";
const commands = new Map<string, CommandHandler>();

commands.set("create-applications-modal", applicationCommand);

export const messageCreate = async (message: Message) => {
  if (message.author.bot) return;
  message.content = message.content.trim();
  if (!message.content.startsWith(PREFIX)) return;
  const args = message.content.split(" ");
  const command = args.shift()?.toLowerCase().slice(PREFIX.length);
  if (!command) return;
  const handler = commands.get(command);
  if (!handler) return;
  try {
    await handler(message);
  } catch (error) {
    console.error(error);
  }
  message.delete();
};
