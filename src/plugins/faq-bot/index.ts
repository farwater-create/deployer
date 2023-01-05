import { Client } from "discord.js";
import { config } from "../../lib/config";
import logger from "../../lib/logger";
import responsesJSON from "./responses.json";

const regexps: Set<RegExp> = new Set();

interface Response {
  keywords: Set<RegExp>;
  response: string;
}

const responses: Response[] = [];

for (const json of responsesJSON) {
  console.log(json);
  const responsesSet = new Set<RegExp>();

  for (const keyword of json.keywords) {
    const regexp = new RegExp(`(\b${keyword}\b)`);
    regexps.add(regexp);
    responsesSet.add(regexp);
  }

  responses.push({
    keywords: responsesSet,
    response: json.response,
  });
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
    const matchedRegexps: Set<RegExp> = new Set();

    for (const regexp of regexps) {
      const match = regexp.exec(message.content);
      if (match) matchedRegexps.add(regexp);
    }

    let sendResponse: Response | undefined;
    let highestScore = 0;

    for (const response of responses) {
      let total = 0;
      for (const regexp of response.keywords) {
        if (matchedRegexps.has(regexp)) {
          total++;
        }
      }
      if (total > highestScore) {
        sendResponse = response;
        highestScore = total;
      }
    }

    if (!sendResponse) return;
    const replyText = sendResponse.response;
    try {
      await message.reply({
        content: replyText,
      });
    } catch (error) {
      logger.error(error);
    }
  });
};
