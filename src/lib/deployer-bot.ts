import { Client, ClientOptions, Interaction } from "discord.js";
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
  beforeReadyPlugins?: Plugin[];
}

export class DeployerBot {
  readonly guildID: string;
  readonly clientID: string;
  readonly commands?: BotSlashCommand[];
  private botSlashCommandGuildRepository?: BotSlashCommandGuildRepository;
  private clientOpts: ClientOptions;
  private plugins?: Plugin[];
  private beforeReadyPlugins?: Plugin[];
  constructor(options: DeployerBotOptions) {
    this.clientID = options.clientID;
    this.guildID = options.guildID;
    this.clientOpts = options.clientOpts;
    this.commands = options.slashCommands;
    this.plugins = options.plugins;
    this.beforeReadyPlugins = options.beforeReadyPlugins;
  }
  private async handleInteraction(interaction: Interaction) {
    this.botSlashCommandGuildRepository?.resolve(interaction);
  }
  private clientFactory(): Client {
    const client = new Client(this.clientOpts);
    client.on("interactionCreate", this.handleInteraction.bind(this));
    if (this.beforeReadyPlugins)
      for (const plugin of this.beforeReadyPlugins) plugin(client);
    client.on("ready", (client) => {
      console.log(`Logged in as ${client.user.username}`);
    });
    return client;
  }
  async login(token: string | undefined) {
    if (!token) {
      throw new Error("invalid token");
    }
    const client = this.clientFactory();
    await client.login(token);
    this.botSlashCommandGuildRepository = new BotSlashCommandGuildRepository(
      this.clientID,
      token,
      this.guildID
    );
    if (this.commands)
      this.botSlashCommandGuildRepository.add(...this.commands);
    await this.botSlashCommandGuildRepository.push();
    if (this.plugins) for (const plugin of this.plugins) plugin(client);
  }
}
