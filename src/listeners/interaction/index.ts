import { Interaction } from "discord.js";
import { config } from "@lib/config"
import { logger } from "@logger";

export const interactionCreate = async (interaction: Interaction) => {
  if(interaction.guildId != config.GUILD_ID) {
    interaction.guild?.leave();
    logger.warn(`Received interaction from unknown guild: ${interaction.guild?.toJSON() || "unknown"}`, )
    return;
  }
};
