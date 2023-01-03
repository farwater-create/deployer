"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/prefer-top-level-await */
const blacklist_json_1 = __importDefault(require("./blacklist.json"));
const axios_1 = __importDefault(require("axios"));
const badURLS = new Set(blacklist_json_1.default.urls);
const LOGS_CHANNEL = "1045241784445435977";
let logChannel;
(0, axios_1.default)({
    url: "https://dbl.oisd.nl/",
    method: "GET",
    responseType: "blob",
}).then((response) => {
    response.data.split("\n").forEach((url) => {
        if (url[0] != "#")
            badURLS.add(url);
    });
    console.log("blacklisted" + " " + badURLS.size + " urls");
});
const MatchURL = /(https?:\/\/(?:www\.|(?!www))[\dA-Za-z][\dA-Za-z-]+[\dA-Za-z]\.\S{2,}|www\.[\dA-Za-z][\dA-Za-z-]+[\dA-Za-z]\.\S{2,}|https?:\/\/(?:www\.|(?!www))[\dA-Za-z]+\.\S{2,}|www\.[\dA-Za-z]+\.\S{2,})/gm;
exports.default = async (client) => {
    client.on("ready", async () => {
        logChannel =
            client.channels.cache.get(LOGS_CHANNEL) ||
                (await client.channels.fetch(LOGS_CHANNEL));
    });
    client.on("messageCreate", async (message) => {
        if (message.author.bot && message.author.id != "1042552045569327166")
            return;
        const urls = new Set();
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
            }
            catch (error) {
                console.error(error);
            }
        });
        for (const url of urls) {
            if (badURLS.has(url)) {
                await message.delete();
                await logChannel.send(`user <@${message.author.id}> sent bad url \n${url}`);
                return;
            }
        }
    });
};
