import { config } from "@config";
import { MinecraftApplicationCustomId } from "@models/application/application";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

const { RULES_CHANNEL_ID, GUILD_ID, BOT_USER_ID } = config;
const rulesChannelLink = `https://discord.com/channels/${GUILD_ID}/${RULES_CHANNEL_ID}`;

const TITLE = "🚀 Whitelist Application Process 📝";

const DESCRIPTION = `## Whitelist Application Process

Welcome to our Minecraft server discord whitelist application process! We're excited to have you join our community. To ensure a safe and fun environment for everyone, we have a simple application process. Here's how it works:

1. **Read the Server Rules**: Check out ${rulesChannelLink} to get familiar with our server rules. It's important everyone follows these rules for a smooth and enjoyable experience.

2. **Review Process**: Our team will review your application based on compatibility, experience, and community engagement. We’ll respond as quickly as possible.

3. **Notification**: If accepted, you’ll get a direct message from our bot <@${BOT_USER_ID}> with joining instructions.

4. **Get Started!**: Check out the new channels you now have access to for setup instructions and important details about the server.

Remember, the whitelist application process helps us maintain a positive and fun community. We appreciate your interest in our community and we can't wait to play with you! 🎮✨

Click the button below to get started!
`;

const MinecraftApplicationSubmissionEmbed = (serverId: string, roleId: string) => {
    return new EmbedBuilder()
        .setTitle(TITLE)
        .setDescription(DESCRIPTION)
        .setThumbnail("https://media.forgecdn.net/avatars/thumbnails/444/296/64/64/637698958460822126.png")
        .addFields([
            {
                name: "serverId",
                value: serverId,
            },
            {
                name: "roleId",
                value: roleId,
            },
        ]);
};

export const MinecraftApplicationStartMessageOptions = (serverId: string, roleId: string) => {
    return {
        embeds: [MinecraftApplicationSubmissionEmbed(serverId, roleId)],
        components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(MinecraftApplicationCustomId.Start)
                    .setLabel("Apply")
                    .setStyle(ButtonStyle.Success),
            ),
        ],
    };
};
