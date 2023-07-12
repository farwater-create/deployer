import { Client, GatewayIntentBits } from "discord.js";
import { ready } from "listeners/ready";
import { config } from "@lib/config";
import { messageCreate } from "listeners/message-create";
import { interactionCreate } from "listeners/interaction/interaction-create";

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.DirectMessages,
];

const client = new Client({
  intents,
});

client.on("interactionCreate", interactionCreate);
client.on("messageCreate", messageCreate);
client.on("ready", ready);

client.login(config.BOT_TOKEN);
