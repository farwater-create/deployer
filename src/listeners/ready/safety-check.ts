import { logger } from "@lib/logger";
import {
  ChannelType,
  Client,
  PermissionResolvable,
  PermissionsBitField,
} from "discord.js";
import { config } from "@config";
/**
 * @param client
 * This function checks if the bot has all the required permissions to run.
 * It also sets up the bots environment.
 * If it doesn't, it will throw an error.
 * @throws {Error} If the bot doesn't have all the required permissions.
 */
export const safetyCheck = async (client: Client) => {
  const guild = await client.guilds.fetch(config.GUILD_ID);
  if (!guild)
    throw new Error(
      `Guild with ID ${config.GUILD_ID} not found! (Did you invite the bot to your server?)`,
    );

  const logChannel = await guild.channels.fetch(config.LOG_CHANNEL_ID);
  if (!logChannel)
    throw new Error(`Log channel with ID ${config.LOG_CHANNEL_ID} not found!`);
  if (logChannel.type !== ChannelType.GuildText)
    throw new Error(
      `Log channel with ID ${config.LOG_CHANNEL_ID} is not a text channel!`,
    );
  logger.logChannel = logChannel;
  logger.info(`✅ Log channel found! (${logChannel.name})`);

  const permissions = new Map<PermissionResolvable, string>([
    [PermissionsBitField.Flags.SendMessages, "Send Messages"],
    [PermissionsBitField.Flags.EmbedLinks, "Embed Links"],
    [PermissionsBitField.Flags.AttachFiles, "Attach Files"],
    [PermissionsBitField.Flags.AddReactions, "Add Reactions"],
    [PermissionsBitField.Flags.ManageMessages, "Manage Messages"],
    [PermissionsBitField.Flags.ReadMessageHistory, "Read Message History"],
    [PermissionsBitField.Flags.MentionEveryone, "Mention Everyone"],
    [PermissionsBitField.Flags.KickMembers, "Kick Members"],
    [PermissionsBitField.Flags.BanMembers, "Ban Members"],
    [PermissionsBitField.Flags.ManageRoles, "Manage Roles"],
    [PermissionsBitField.Flags.ManageChannels, "Manage Channels"],
    [PermissionsBitField.Flags.ManageGuild, "Manage Guild"],
  ]);

  const member = await guild.members.fetch(client.user!.id);
  if (!member)
    throw new Error(
      `Member with ID ${
        client.user!.id
      } not found! (Did you invite the bot to your server?)`,
    );
  for (const [permission, permissionName] of permissions) {
    if (!member.permissions.has(permission))
      throw new Error(`Missing permission ${permissionName}!`);
  }
  logger.info("✅ Bot has all required permissions!");
};
