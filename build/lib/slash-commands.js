"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotSlashCommandGuildRepository = void 0;
const discord_js_1 = require("discord.js");
const logger_1 = __importDefault(require("./logger"));
class BotSlashCommandGuildRepository {
    commands = new Map();
    rest;
    clientID;
    guildID;
    constructor(clientID, token, guildID) {
        this.clientID = clientID;
        this.guildID = guildID;
        this.rest = new discord_js_1.REST({ version: "10" }).setToken(token);
    }
    add(...commands) {
        commands.forEach((command) => {
            this.commands.set(command.json.name, command);
        });
    }
    resolve(interaction) {
        if (interaction.isCommand()) {
            try {
                this.commands.get(interaction.commandName)?.handler(interaction);
            }
            catch (error) {
                logger_1.default.error(error);
            }
        }
    }
    async push() {
        const body = [];
        this.commands.forEach((command) => {
            body.push(command.json);
        });
        await this.rest.put(discord_js_1.Routes.applicationGuildCommands(this.clientID, this.guildID), { body });
        logger_1.default.info(`reloaded ${body.length} slash commands`);
    }
}
exports.BotSlashCommandGuildRepository = BotSlashCommandGuildRepository;
