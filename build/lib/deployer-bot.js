"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployerBot = void 0;
const discord_js_1 = require("discord.js");
const logger_1 = __importDefault(require("./logger"));
const slash_commands_1 = require("./slash-commands");
class DeployerBot {
    guildID;
    clientID;
    commands;
    botSlashCommandGuildRepository;
    clientOpts;
    plugins;
    constructor(options) {
        this.clientID = options.clientID;
        this.guildID = options.guildID;
        this.clientOpts = options.clientOpts;
        this.commands = options.slashCommands;
        this.plugins = options.plugins;
    }
    async handleInteraction(interaction) {
        this.botSlashCommandGuildRepository?.resolve(interaction);
    }
    clientFactory() {
        const client = new discord_js_1.Client(this.clientOpts);
        client.on("interactionCreate", this.handleInteraction.bind(this));
        client.on("ready", (client) => {
            logger_1.default.info(`Logged in as ${client.user.username}`);
        });
        return client;
    }
    async login(token) {
        if (!token) {
            throw new Error("invalid token");
        }
        const client = this.clientFactory();
        await client.login(token);
        if (this.plugins)
            for (const plugin of this.plugins)
                plugin(client);
        this.botSlashCommandGuildRepository = new slash_commands_1.BotSlashCommandGuildRepository(this.clientID, token, this.guildID);
        if (this.commands)
            this.botSlashCommandGuildRepository.add(...this.commands);
        await this.botSlashCommandGuildRepository.push();
    }
}
exports.DeployerBot = DeployerBot;
