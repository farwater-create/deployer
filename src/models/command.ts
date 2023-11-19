import {
  CommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from "discord.js";

export type Command = {
  json: RESTPostAPIApplicationCommandsJSONBody;
  handler: (interaction: CommandInteraction) => unknown;
};

export type ContextCommand = {
  json: RESTPostAPIContextMenuApplicationCommandsJSONBody;
  handler: (interaction: CommandInteraction) => unknown;
};
