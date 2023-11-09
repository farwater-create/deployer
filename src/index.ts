import { ButtonInteraction, CacheType, Client, Collection, CommandInteraction, GatewayIntentBits, Interaction, PermissionsBitField, SlashCommandBuilder, StringSelectMenuInteraction } from "discord.js";
import { config } from "@lib/config";
import { minecraftApplicationModalHandler } from "@controllers/applications/minecraft/handle-minecraft-application-modal";
import { safetyCheck } from "@controllers/startup/safety-check";
import { minecraftApplicationModalApplyButtonHandler } from "@controllers/applications/minecraft/handle-minecraft-application-modal-apply-button-press";
import { CommandCollection } from "@controllers/commands/commands";
import { MinecraftApplicationStartMessage } from "@views/application/minecraft-application-start-message";
import { minecraftApplicationDenyHandler } from "@controllers/applications/minecraft/handle-minecraft-application-deny";
import { logger } from "@logger";
import { hasCooldown } from "@lib/interaction-cooldown";

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.GuildModeration
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
    interaction.channel?.send(MinecraftApplicationStartMessage)
  }
})





client.on("interactionCreate", interaction => {

  if(hasCooldown(interaction, 2000)) {
    if(interaction.isRepliable()) {
      interaction.reply("You're doing that too fast!");
    }
    return;
  }

  if(interaction.isCommand()) {
    CommandCollection.handle(interaction);
    return;
  }

  if(interaction.isModalSubmit()) {
    minecraftApplicationModalHandler(interaction);
    return;
  }

  if(interaction.isButton()) {
    minecraftApplicationModalApplyButtonHandler(interaction);
    return;
  }

  if(interaction.isStringSelectMenu()) {
    minecraftApplicationDenyHandler(interaction);
    return;
  }
});

client.on("ready", async (client) => {
  await safetyCheck(client);
  CommandCollection.register(config.BOT_TOKEN, config.CLIENT_ID, config.GUILD_ID);
  logger.discord("info", "Started deployer")
});

client.on("error", (e) => {
  logger.discord("error", e);
})

client.login(config.BOT_TOKEN);
