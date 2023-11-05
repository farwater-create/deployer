import { CommandInteraction, RESTPostAPIApplicationCommandsJSONBody } from "discord.js"

export type Command = {
  json: RESTPostAPIApplicationCommandsJSONBody
  handler: (interaction: CommandInteraction) => unknown
}
