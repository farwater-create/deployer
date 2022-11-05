import { Client } from "discord.js";

export default (client: Client) => {
  client.on("messageCreate", (message) => {
    if (message.content.includes("ඞ")) {
      message.reply("sus");
    }
  });
};
