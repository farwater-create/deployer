import {
  CommandInteraction,
  Interaction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { REST, Routes } from "discord.js";

export interface BotSlashCommand {
  json: RESTPostAPIChatInputApplicationCommandsJSONBody;
  handler: (interaction: CommandInteraction) => unknown;
}

export class BotSlashCommandGuildRepository {
  private commands: Map<string, BotSlashCommand> = new Map();
  private rest: REST;
  private clientID: string;
  private guildID: string;
  constructor(clientID: string, token: string, guildID: string) {
    this.clientID = clientID;
    this.guildID = guildID;
    this.rest = new REST({ version: "10" }).setToken(token);
  }
  add(...commands: BotSlashCommand[]) {
    commands.forEach((command) => {
      this.commands.set(command.json.name, command);
    });
  }
  resolve(interaction: Interaction) {
    if (interaction.isCommand()) {
      try {
        this.commands.get(interaction.commandName)?.handler(interaction);
      } catch (error) {
        console.error(error);
      }
    }
  }
  async push() {
    const body: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    this.commands.forEach((command: BotSlashCommand) => {
      body.push(command.json);
    });
    const data = await this.rest.put(
      Routes.applicationGuildCommands(this.clientID, this.guildID),
      { body }
    );
    console.log(`reloaded ${body.length} slash commands`);
  }
}
