import { config } from "@config";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageCreateOptions,
} from "discord.js";

export enum MinecraftApplicationEvent {
  Start = "application-start",
}
const { RULES_CHANNEL_ID, GUILD_ID, APPLICATIONS_CHANNEL_ID, BOT_USER_ID } =
  config;
const rulesChannelLink = `https://discord.com/channels/${GUILD_ID}/${RULES_CHANNEL_ID}`;

const TITLE = "🚀 Whitelist Application Process 📝";

const DESCRIPTION = `## Whitelist Application Process

Welcome to our Minecraft server discord whitelist application process! We're excited to have you join our community. To ensure a safe and fun environment for everyone, we have a simple application process. Here's how it works:

1. **Read the Server Rules**: Check out ${rulesChannelLink} to get familiar with our server rules. It's important to follow these rules for a smooth and enjoyable gaming experience.

2. **Review Process**: Our staff will review your application, considering your compatibility with our server, previous experience, and community engagement. We'll get back to you as soon as possible, so please be patient.

3. **Notification**: We'll send you a direct message with our decision. Make sure your DMS are open to our bot <@${BOT_USER_ID}>. If your application is accepted, you'll receive instructions on joining the server.

Remember, the whitelist application process helps us maintain a positive and fun community. We appreciate your interest in our Minecraft server discord, and we can't wait to play with you! 🎮✨

Click the button below to get started!
`;

const MinecraftApplicationSubmissionEmbed = new EmbedBuilder()
  .setTitle(TITLE)
  .setDescription(DESCRIPTION)
  .setThumbnail(
    "https://media.forgecdn.net/avatars/thumbnails/444/296/64/64/637698958460822126.png",
  );

export const MinecraftApplicationStartMessageOptions: MessageCreateOptions = {
  embeds: [MinecraftApplicationSubmissionEmbed],
  components: [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(MinecraftApplicationEvent.Start)
        .setLabel("Apply")
        .setStyle(ButtonStyle.Success),
    ),
  ],
};
