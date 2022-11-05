import { DeployerBotOptions, DeployerBot } from "./lib/DeployerBot";
import { ping } from "./commands/ping";
import { apply } from "./commands/apply";
import applicationDecisionListener from "./plugins/application-decision-listener";
import { whitelist } from "./commands/whitelist";
import { config } from "./lib/config";
import { unwhitelist } from "./commands/unwhitelist";
import applicationSubmitListener from "./plugins/application-submit-listener";
import easterEgg from "./plugins/easter-egg";
import memberLeaveUnwhitelist from "./plugins/member-leave-unwhitelist";

const opts: DeployerBotOptions = {
  guildID: config.DISCORD_GUILD_ID,
  clientID: config.DISCORD_CLIENT_ID,
  slashCommands: [ping, apply, whitelist, unwhitelist],
  plugins: [
    applicationSubmitListener,
    applicationDecisionListener,
    easterEgg,
    memberLeaveUnwhitelist,
  ],
  clientOpts: {
    intents: ["MessageContent", "GuildBans", "GuildMessageReactions", "Guilds"],
  },
};

const bot = new DeployerBot(opts);
bot.login(config.DISCORD_TOKEN);
