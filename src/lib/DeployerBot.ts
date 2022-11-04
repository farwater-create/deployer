import { Client, ClientOptions, Interaction } from "discord.js";
import {
  BotSlashCommandGuildRepository,
  BotSlashCommand,
} from "./slash-commands";

type Plugin = (client: Client) => unknown;

export interface DeployerBotOptions {
  guildID: string;
  clientID: string;
  slashCommands: BotSlashCommand[];
  clientOpts: ClientOptions;
  plugins: Plugin[];
}

export class DeployerBot {
  readonly guildID: string;
  readonly clientID: string;
  readonly commands: BotSlashCommand[];
  private botSlashCommandGuildRepository?: BotSlashCommandGuildRepository;
  private clientOpts: ClientOptions;
  private plugins: Plugin[];
  private client?: Client;
  constructor(opts: DeployerBotOptions) {
    this.clientID = opts.clientID;
    this.guildID = opts.guildID;
    this.clientOpts = opts.clientOpts;
    this.commands = opts.slashCommands;
    this.plugins = opts.plugins;
  }
  private async handleInteraction(interaction: Interaction) {
    this.botSlashCommandGuildRepository?.resolve(interaction);
  }
  private clientFactory(token: string): Client {
    const client = new Client(this.clientOpts);
    client.on("interactionCreate", this.handleInteraction.bind(this));
    client.on("ready", (client) => {
      console.log(`Logged in as ${client.user.username}`);
    });
    return client;
  }
  async login(token: string | undefined) {
    if (!token) {
      throw new Error("invalid token");
    }
    const client = this.clientFactory(token);
    await client.login(token);
    this.botSlashCommandGuildRepository = new BotSlashCommandGuildRepository(
      this.clientID,
      token,
      this.guildID
    );
    this.botSlashCommandGuildRepository.add(...this.commands);
    await this.botSlashCommandGuildRepository.push();
    this.client = client;
    this.plugins.forEach((plugin) => plugin(client));
  }
}
