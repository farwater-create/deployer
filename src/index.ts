import {
  Client,
  GatewayIntentBits,
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
const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.GuildModeration,
];

const client = new Client({
  intents,
});

CommandCollection.useCommand(applicationsChannelCommand);
CommandCollection.useContextCommand(whitelist);
CommandCollection.useContextCommand(unwhitelist);
CommandCollection.useCommand(skin);

client.on("interactionCreate", async (interaction) => {

  if (interaction.isCommand()) {
    if(interaction.isContextMenuCommand()) {
      CommandCollection.handleContextCommand(interaction);
    } else {
      CommandCollection.handleCommand(interaction);
    }
    return;
  }

  if (interaction.isModalSubmit()) {
    handleMinecraftApplicationModalSubmit(interaction);
    return;
  }

  if (interaction.isButton()) {
    handleMinecraftApplicationDecisionMessageAcceptButtonPress(interaction);
    handleMinecraftApplicationModalApplyButtonPress(interaction);
    return;
  }

  if (interaction.isStringSelectMenu()) {
    handleMinecraftApplicationDecisionMessageStringSelectMenu(interaction);
    return;
  }
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
