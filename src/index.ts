import {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import { config } from "@lib/config";
import { safetyCheck } from "@controllers/startup/safety-check";
import { CommandCollection } from "@controllers/commands/commands";
import { logger } from "@logger";
import { hasCooldown } from "@lib/interaction-cooldown";
import { handleMinecraftApplicationModalApplyButtonPress } from "@controllers/applications/minecraft/handle-minecraft-application-modal-apply-button-press";
import { handleMinecraftApplicationModalSubmit } from "@controllers/applications/minecraft/handle-minecraft-application-modal-submit";
import { handleMinecraftApplicationDecisionMessageStringSelectMenu } from "@controllers/applications/minecraft/handle-minecraft-application-decision-message-string-select-menu";

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

CommandCollection.use({
  json: new SlashCommandBuilder()
    .setName("applications-channel")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .setDescription("Creates the initial application message.")
    .toJSON(),
  handler: (interaction) => {
    interaction.channel?.send(MinecraftApplicationStartMessage);
  },
});

client.on("interactionCreate", (interaction) => {
  if (hasCooldown(interaction, 2000)) {
    if (interaction.isRepliable()) {
      interaction.reply("You're doing that too fast!");
    }
    return;
  }

  if (interaction.isCommand()) {
    CommandCollection.handle(interaction);
    return;
  }

  if (interaction.isModalSubmit()) {
    handleMinecraftApplicationModalSubmit(interaction);
    return;
  }

  if (interaction.isButton()) {
    handleMinecraftApplicationModalApplyButtonPress(interaction);
    return;
  }

  if (interaction.isStringSelectMenu()) {
    handleMinecraftApplicationDecisionMessageStringSelectMenu(interaction);
    return;
  }
});

client.on("ready", async (client) => {
  await safetyCheck(client);
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
