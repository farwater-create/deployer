import { Message } from "discord.js";
import { commandHandler } from "./command-handler";



export const messageCreate = async (message: Message) => {
  await commandHandler(message);
};
