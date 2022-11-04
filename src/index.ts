import { DeployerBotOptions, DeployerBot } from "./lib/DeployerBot";
import dotenv from "dotenv";
import { ping } from "./commands/ping";
dotenv.config();

const assertEnv = (key: string) => {
  if (process.env[key]) {
    return process.env[key] as string;
  }
  throw new Error(`${key} not found`);
};

const opts: DeployerBotOptions = {
  guildID: assertEnv("GUILD_ID"),
  clientID: assertEnv("CLIENT_ID"),
  slashCommands: [ping],
  plugins: [],
  clientOpts: {
    intents: ["MessageContent", "GuildBans", "GuildMessageReactions", "Guilds"],
  },
};

const bot = new DeployerBot(opts);
bot.login(assertEnv("TOKEN"));
