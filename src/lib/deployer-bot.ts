import { Client, ClientOptions, Interaction } from "discord.js";
import logger from "./logger";
import {
  BotSlashCommandGuildRepository,
  BotSlashCommand,
} from "./slash-commands";

type Plugin = (client: Client) => unknown;

export interface DeployerBotOptions {
  guildID: string;
  clientID: string;
  slashCommands?: BotSlashCommand[];
  clientOpts: ClientOptions;
  plugins?: Plugin[];
}

export class DeployerBot {
  readonly guildID: string;
  readonly clientID: string;
  readonly commands?: BotSlashCommand[];
  private botSlashCommandGuildRepository?: BotSlashCommandGuildRepository;
  private clientOpts: ClientOptions;
  private plugins?: Plugin[];
  constructor(options: DeployerBotOptions) {
    this.clientID = options.clientID;
    this.guildID = options.guildID;
    this.clientOpts = options.clientOpts;
    this.commands = options.slashCommands;
    this.plugins = options.plugins;
  }
  private async handleInteraction(interaction: Interaction) {
    this.botSlashCommandGuildRepository?.resolve(interaction);
  }
  private clientFactory(): Client {
    const client = new Client(this.clientOpts);
    client.on("interactionCreate", this.handleInteraction.bind(this));
    client.on("ready", (client) => {
      logger.info(`Logged in as ${client.user.username}`);
    });
    return client;
  }
  async login(token: string | undefined) {
    if (!token) {
      throw new Error("invalid token");
    }
    const client = this.clientFactory();
    if (this.plugins) for (const plugin of this.plugins) plugin(client);
    this.botSlashCommandGuildRepository = new BotSlashCommandGuildRepository(
      this.clientID,
      token,
      this.guildID
    );
    await client.login(token);
    if (this.commands)
      this.botSlashCommandGuildRepository.add(...this.commands);
    await this.botSlashCommandGuildRepository.push();
  }
}
