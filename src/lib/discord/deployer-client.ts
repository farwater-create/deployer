import {type MinecraftApplicationCustomId} from "@models/application/application";
import {Client, CommandInteraction, ContextMenuCommandInteraction, Interaction} from "discord.js";
import {EventEmitter} from "node:events";

const hasCustomId = (interaction: Interaction): interaction is Interaction & {customId: string} => {
    return Object.hasOwn(interaction, "customId");
};

export declare interface DeployerInteractionRouter {
    on<T extends Interaction>(event: MinecraftApplicationCustomId, listener: (interaction: T) => void): this;
    on(event: "contextCommand", listener: (interaction: ContextMenuCommandInteraction) => void): this;
    on(event: "command", listener: (interaction: CommandInteraction) => void): this;
}

export class DeployerInteractionRouter extends EventEmitter {
    client: Client;
    constructor(client: Client) {
        super();
        this.client = client;
        client.on("interactionCreate", (i) => {
            if (i.isContextMenuCommand()) {
                this.emit("contextCommand", i);
                return;
            }
            if (i.isCommand()) {
                this.emit("command", i);
                return;
            }
            if (hasCustomId(i)) {
                this.emit(i.customId, i);
            }
        });
    }
}
