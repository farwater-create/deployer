"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable unicorn/prefer-module */
const deployer_bot_1 = require("./lib/deployer-bot");
const ping_1 = require("./commands/ping");
const application_decision_listener_1 = __importDefault(require("./plugins/application-decision-listener"));
const whitelist_1 = require("./commands/whitelist");
const config_1 = require("./lib/config");
const application_submit_listener_1 = __importDefault(require("./plugins/application-submit-listener"));
const member_leave_unwhitelist_listener_1 = __importDefault(require("./plugins/member-leave-unwhitelist-listener"));
const application_embed_listener_1 = __importDefault(require("./plugins/application-embed-listener"));
const whois_1 = require("./commands/whois");
const message_embed_filter_1 = __importDefault(require("./plugins/message-embed-filter"));
const node_worker_threads_1 = require("node:worker_threads");
const logger_1 = __importDefault(require("./lib/logger"));
const options = {
    guildID: config_1.config.DISCORD_GUILD_ID,
    clientID: config_1.config.DISCORD_CLIENT_ID,
    slashCommands: [ping_1.ping, whitelist_1.whitelist, whois_1.whois],
    plugins: [
        application_submit_listener_1.default,
        application_decision_listener_1.default,
        application_embed_listener_1.default,
        member_leave_unwhitelist_listener_1.default,
        message_embed_filter_1.default,
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
if (node_worker_threads_1.isMainThread) {
    let worker = new node_worker_threads_1.Worker(__filename);
    worker.addListener("error", (event) => {
        logger_1.default.error(event);
        worker = new node_worker_threads_1.Worker(__filename);
    });
    worker.addListener("online", () => {
        logger_1.default.info("started worker thread");
    });
    process.on("beforeExit", () => {
        worker.terminate();
    });
}
else {
    const bot = new deployer_bot_1.DeployerBot(options);
    bot.login(config_1.config.DISCORD_TOKEN);
}
