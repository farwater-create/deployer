import {
    ButtonInteraction,
    Client,
    GatewayIntentBits,
    GuildMember,
    ModalSubmitInteraction,
    PartialGuildMember,
    StringSelectMenuInteraction,
} from "discord.js";

import { handleMinecraftApplicationDecisionMessageAcceptButtonPress } from "@controllers/applications/minecraft/handle-minecraft-application-decision-message-accept-button-press";
import { handleMinecraftApplicationDecisionMessageStringSelectMenu } from "@controllers/applications/minecraft/handle-minecraft-application-decision-message-string-select-menu";
import { handleMinecraftApplicationModalApplyButtonPress } from "@controllers/applications/minecraft/handle-minecraft-application-modal-apply-button-press";
import { handleMinecraftApplicationModalSubmit } from "@controllers/applications/minecraft/handle-minecraft-application-modal-submit";
import { applicationsChannelCommand } from "@controllers/commands/applications-channel";
import { CommandCollection } from "@controllers/commands/commands";
import { linkMinecraftCommand } from "@controllers/commands/minecraft-link";
import { lookupLinkApp, lookupLinkCommand } from "@controllers/commands/minecraft-lookup";
import { unlinkMinecraftCommand } from "@controllers/commands/minecraft-unlink";
import { unwhitelist } from "@controllers/commands/unwhitelist";
import { whitelist } from "@controllers/commands/whitelist";
import { safetyCheck } from "@controllers/startup/safety-check";
import { config } from "@lib/config";
import { DeployerInteractionRouter } from "@lib/discord/deployer-client";
import { logger } from "@logger";
import { MinecraftApplicationCustomId } from "@models/application/application";
import { onUserJoin } from "@controllers/events/user-join";
import { onUserLeave } from "@controllers/events/user-leave";
import { onMemberRoleUpdate } from "@controllers/events/member-role-update";

const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildModeration,
];

CommandCollection.useCommand(applicationsChannelCommand);
CommandCollection.useCommand(linkMinecraftCommand);
CommandCollection.useCommand(lookupLinkCommand);
CommandCollection.useCommand(unlinkMinecraftCommand);
CommandCollection.useContextCommand(whitelist);
CommandCollection.useContextCommand(unwhitelist);
CommandCollection.useContextCommand(lookupLinkApp);

const client = new Client({
    intents,
});

const interactionRouter = new DeployerInteractionRouter(client);

interactionRouter.on<ButtonInteraction>(MinecraftApplicationCustomId.Accept, (interaction) => {
    handleMinecraftApplicationDecisionMessageAcceptButtonPress(interaction);
});

interactionRouter.on<ButtonInteraction>(MinecraftApplicationCustomId.Start, (interaction) => {
    handleMinecraftApplicationModalApplyButtonPress(interaction);
});

interactionRouter.on<StringSelectMenuInteraction>(MinecraftApplicationCustomId.Reject, (interaction) => {
    handleMinecraftApplicationDecisionMessageStringSelectMenu(interaction);
});

interactionRouter.on<ModalSubmitInteraction>(MinecraftApplicationCustomId.Submit, (interaction) => {
    handleMinecraftApplicationModalSubmit(interaction);
});

interactionRouter.on("command", (interaction) => {
    CommandCollection.handleCommand(interaction);
});

interactionRouter.on("contextCommand", (interaction) => {
    CommandCollection.handleContextCommand(interaction);
});

client.on("ready", async (client) => {
    await safetyCheck(client).catch((error) => {
        logger.error(error);
        process.exit(1);
    });
    CommandCollection.register(config.BOT_TOKEN, config.CLIENT_ID, config.GUILD_ID);
    logger.discord("info", "Started deployer");
});

client.on('guildMemberAdd', (member) => {
    onUserJoin(member);
});

client.on('guildMemberRemove', (member) => {
    onUserLeave(member);
});

client.on('guildMemberUpdate', async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember | PartialGuildMember) => {
    onMemberRoleUpdate(oldMember, newMember);
});

client.on("error", (e) => {
    logger.discord("error", e);
});

client.login(config.BOT_TOKEN);
