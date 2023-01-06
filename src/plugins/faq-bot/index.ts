import { Client } from "discord.js";
import { config } from "../../lib/config";
import logger from "../../lib/logger";
import { PhraseMap } from "./phrase-map";
import responses from "./responses";

const phraseMap = new PhraseMap();

for (const response of responses) {
  phraseMap.add(response);
}

const faqChannel = config.FAQ_CHANNEL;
export default async (client: Client) => {
  const channel = await client.guilds.cache
    .get(config.DISCORD_GUILD_ID)
    ?.channels.fetch(faqChannel);
  if (!channel) throw new Error("FAQ Channel not found!");
  client.on("messageCreate", async (message) => {
    if (message.channelId != channel.id) return;
    if (message.author.bot) return;
    const replyText = phraseMap.resolve(message.content);
    if (!replyText) return;
    try {
      await message.reply({
        content: replyText,
      });
    } catch (error) {
      logger.error(error);
    }
  });
};
