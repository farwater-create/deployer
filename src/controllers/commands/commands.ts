import {logger} from "@logger";
import {Command, ContextCommand} from "@models/command";
import {
    CommandInteraction,
    ContextMenuCommandInteraction,
    REST,
    RESTPostAPIApplicationCommandsJSONBody,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
    Routes,
} from "discord.js";

export class CommandCollection {
    private static commandsMap = new Map<string, Command>();
    private static contextMenuCommandsMap = new Map<string, ContextCommand>();

    static useCommand(command: Command) {
        this.commandsMap.set(command.json.name, command);
    }

    static useContextCommand(command: ContextCommand) {
        this.contextMenuCommandsMap.set(command.json.name, command);
    }

    static handleContextCommand(interaction: ContextMenuCommandInteraction) {
        Promise.resolve(this.contextMenuCommandsMap.get(interaction.commandName)?.handler(interaction)).catch(() => {
            if (!interaction.replied) {
                interaction.reply("Internal server error").catch(logger.error);
            }
        });
    }

    static handleCommand(interaction: CommandInteraction) {
        Promise.resolve(this.commandsMap.get(interaction.commandName)?.handler(interaction)).catch(() => {
            if (!interaction.replied) {
                interaction.reply("Internal server error").catch((err) => {
                    logger.discord("error", "Failed to reply to interaction. `" + err + "`");
                });
            }
        });
    }

    static async register(token: string, clientId: string, guildId: string) {
        const commands: Array<
            RESTPostAPIApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody
        > = [];

        this.commandsMap.forEach((c) => {
            commands.push(c.json);
        });

        this.contextMenuCommandsMap.forEach((c) => {
            commands.push(c.json);
        });

        if (commands.length === 0) {
            throw new Error("no commands to register to guild.");
        }

        const rest = new REST().setToken(token);
        await rest
            .put(Routes.applicationGuildCommands(clientId, guildId), {
                body: commands,
            })
            .catch((err) => {
                logger.error(err);
                process.exit(1);
            });
    }
}
