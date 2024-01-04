import {MinecraftApplication} from "@controllers/applications/minecraft/application";
import {EmbedBuilder, MessageReplyOptions} from "discord.js";

export const MinecraftApplicationWhitelistMessageOptions = (application: MinecraftApplication): MessageReplyOptions => {
    const {minecraftName, discordId} = application.getOptions();
    return {
        content: `<@${discordId}>`,
        embeds: [
            new EmbedBuilder()
                .setTitle("Whitelisted " + minecraftName)
                .setImage(new URL(`https://mc-heads.net/body/${minecraftName}.png`).toString())
                .setDescription(
                    `Hi <@${discordId}>! Your application was approved - Welcome to Farwater! You should now have full access to the channels and our Minecraft servers. If you haven't already please read the rules.`,
                ),
        ],
    };
};
