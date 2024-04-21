import { config } from "@config";
import { MinecraftApplication } from "@controllers/applications/minecraft/application";
import { logger } from "@logger";
import { Colors, EmbedBuilder, MessageReplyOptions } from "discord.js";

const { GUILD_ID } = config;

const infoChannelLink = `https://discord.com/channels/${GUILD_ID}/1113859936389185618`;

export const MinecraftApplicationWhitelistMessageOptions = async (
    application: MinecraftApplication,
): Promise<MessageReplyOptions> => {
    const { discordId } = application.getOptions();
    const farwaterUser = await application.getFarwaterUser();
    if (!farwaterUser?.getOptions().minecraftName) logger.error("farwaterUser is null");
    return {
        content: `<@${discordId}>`,
        embeds: [
            new EmbedBuilder()
                .setTitle("Whitelisted " + farwaterUser?.getOptions().minecraftName)
                .setColor(Colors.Green)
                .setThumbnail(`https://mc-heads.net/head/${farwaterUser?.getOptions().minecraftName}.png`)
                .setImage(
                    new URL(`https://mc-heads.net/body/${farwaterUser?.getOptions().minecraftName}.png`).toString(),
                )
                .setDescription(
                    `Hi <@${discordId}>! Your application was approved - Welcome to Farwater! You should now have full access to the channels and our Minecraft servers. Check out ${infoChannelLink} for setup instructions and important server details. If you haven't already, please read the rules.`,
                ),
        ],
    };
};
