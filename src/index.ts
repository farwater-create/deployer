import {
  ButtonInteraction,
  Client,
  GatewayIntentBits,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
} from "discord.js";

import { config } from "@lib/config";
import { safetyCheck } from "@controllers/startup/safety-check";
import { CommandCollection } from "@controllers/commands/commands";
import { logger } from "@logger";
import { handleMinecraftApplicationModalApplyButtonPress } from "@controllers/applications/minecraft/handle-minecraft-application-modal-apply-button-press";
import { handleMinecraftApplicationModalSubmit } from "@controllers/applications/minecraft/handle-minecraft-application-modal-submit";
import { handleMinecraftApplicationDecisionMessageStringSelectMenu } from "@controllers/applications/minecraft/handle-minecraft-application-decision-message-string-select-menu";
import { handleMinecraftApplicationDecisionMessageAcceptButtonPress } from "@controllers/applications/minecraft/handle-minecraft-application-decision-message-accept-button-press";
import { applicationsChannelCommand } from "@controllers/commands/applications-channel";
import { whitelist } from "@controllers/commands/whitelist";
import { unwhitelist } from "@controllers/commands/unwhitelist";
import { skin } from "@controllers/commands/skin";
import { DeployerInteractionRouter } from "@lib/discord/deployer-client";
import { MinecraftApplicationCustomId } from "@models/application/application";

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.GuildModeration,
];

CommandCollection.useCommand(applicationsChannelCommand);
CommandCollection.useContextCommand(whitelist);
CommandCollection.useContextCommand(unwhitelist);
CommandCollection.useContextCommand(skin);

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

interactionRouter.on("command", interaction => {
  CommandCollection.handleCommand(interaction);
});

interactionRouter.on("contextCommand", interaction => {
  CommandCollection.handleContextCommand(interaction);
});

client.on("ready", async (client) => {
  await safetyCheck(client).catch(error => {
    logger.error(error);
    process.exit(1);
  })
  CommandCollection.register(
    config.BOT_TOKEN,
    config.CLIENT_ID,
    config.GUILD_ID,
  );
  logger.discord("info", "Started deployer");
});

client.on("error", (e) => {
  logger.discord("error", e);
});

client.login(config.BOT_TOKEN);
