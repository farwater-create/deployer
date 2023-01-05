/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/prefer-top-level-await */
import blacklist from "./blacklist.json";
import { Client, TextChannel } from "discord.js";
import axios from "axios";
import logger from "../lib/logger";

const badURLS: Set<string> = new Set(blacklist.urls);

const LOGS_CHANNEL = "1045241784445435977";

let logChannel: TextChannel;

const MatchURL =
  /(https?:\/\/(?:www\.|(?!www))[\dA-Za-z][\dA-Za-z-]+[\dA-Za-z]\.\S{2,}|www\.[\dA-Za-z][\dA-Za-z-]+[\dA-Za-z]\.\S{2,}|https?:\/\/(?:www\.|(?!www))[\dA-Za-z]+\.\S{2,}|www\.[\dA-Za-z]+\.\S{2,})/gm;

export default async (client: Client) => {
  client.on("ready", async () => {
    logChannel =
      (client.channels.cache.get(LOGS_CHANNEL) as TextChannel) ||
      ((await client.channels.fetch(LOGS_CHANNEL)) as TextChannel);
    axios({
      url: "https://dbl.oisd.nl/",
      method: "GET",
      responseType: "blob",
    }).then((response) => {
      response.data.split("\n").forEach((url: string) => {
        if (url[0] != "#") badURLS.add(url);
      });
      logger.log("blacklisted" + " " + badURLS.size + " urls");
    });
  });

  client.on("messageCreate", async (message) => {
    if (message.author.bot && message.author.id != "1042552045569327166")
      return;
    const urls: Set<string> = new Set();
    const matches = MatchURL.exec(message.content);
    matches?.forEach((value) => {
      urls.add(new URL(value).hostname);
    });
    message.embeds.forEach((embed) => {
      try {
        if (embed.url) {
          urls.add(embed.url);
          urls.add(new URL(embed.url).hostname);
        }
      } catch (error) {
        logger.error(error);
      }
    });
    for (const url of urls) {
      if (badURLS.has(url)) {
        try {
          await message.delete();
          // eslint-disable-next-line no-empty
        } catch {}
        await logChannel.send(
          `user <@${message.author.id}> sent bad url \n${url}`
        );
        return;
      }
    }
  });
};
