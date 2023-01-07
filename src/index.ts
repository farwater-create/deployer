import { DeployerBotOptions, DeployerBot } from "./lib/deployer-bot";
import { ping } from "./commands/ping";
import applicationDecisionListener from "./plugins/application-decision-listener";
import { whitelist } from "./commands/whitelist";
import { config } from "./lib/config";
import applicationSubmitListener from "./plugins/application-submit-listener";
import memberLeaveUnwhitelistListener from "./plugins/member-leave-unwhitelist";
import applicationEmbedListener from "./plugins/application-embed-listener";
import { whois } from "./commands/whois";
import messageEmbedFilter from "./plugins/message-embed-filter";
import faqBot from "./plugins/faq-bot";
import leaveUknownGuilds from "./plugins/leave-unknown-guilds";
import { Client } from "discord.js";

const options: DeployerBotOptions = {
  guildID: config.DISCORD_GUILD_ID,
  clientID: config.DISCORD_CLIENT_ID,
  slashCommands: [ping, whitelist, whois],
  plugins: [
    applicationSubmitListener,
    applicationDecisionListener,
    applicationEmbedListener,
    memberLeaveUnwhitelistListener,
    messageEmbedFilter,
    faqBot,
    leaveUknownGuilds,
    (client: Client) => {
      process.on("beforeExit", () => {
        client.destroy();
      });
    },
  ],
  clientOpts: {
    intents: [
      "MessageContent",
      "GuildBans",
      "GuildMessageReactions",
      "Guilds",
      "GuildMembers",
      "GuildMessages",
      "DirectMessageReactions",
      "DirectMessages",
    ],
  },
};

const bot = new DeployerBot(options);
bot.login(config.DISCORD_TOKEN);
