import { logger } from "@lib/logger";
import {
  ChannelType,
  Client,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  PermissionResolvable,
  PermissionsBitField,
} from "discord.js";
import { config } from "@config";

const requiredPermissions = new Map<PermissionResolvable, string>([
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

const requiredRoles = [
  config.ADMIN_ROLE_ID,
]

/**
 * @param client
 * This function checks if the bot has all the required permissions to run.
 * It also sets up the bots environment.
 * If it doesn't, it will throw an error.
 * @throws {Error} If the bot doesn't have all the required permissions.
 */
export const safetyCheck = async (client: Client) => {
  await assertBotUser(client);

  const guild = await assertGuild(client, config.GUILD_ID);

  const logChannel = await assertChannel<GuildTextBasedChannel>(guild, config.LOG_CHANNEL_ID, ChannelType.GuildText);
  logger.logChannel = logChannel;

  const member = await assertBotMember(guild, client);

  await assertPermissions(member, requiredPermissions);

  for (const roleId of requiredRoles) {
    await assertRole(guild, roleId);
  }

  logger.info("✅ Safety check passed!");
};

/**
 * Assert that the guild specified by guildId exists in client cache
 * @param client
 * @returns
 */
const assertGuild = async (client: Client, guildId: string) => {
  const guild = await client.guilds.fetch(guildId);
  if (!guild)
    throw new Error(
      `Guild with ID ${config.GUILD_ID} not found! (Did you invite the bot to your server?)`
    );
  return guild;
};

/**
 *  Assert that the channel specified by channelId exists in guild
 * @param guild
 * @param channelId
 * @param type
 * @returns
 */
const assertChannel = async <T>(guild: Guild, channelId: string, type: ChannelType) => {
  const channel = await guild.channels.fetch(channelId);
  if (!channel)
    throw new Error(
      `Log channel with ID ${channelId} not found!`
    );
  if (channel.type !== type)
    throw new Error(
      `Log channel with ID ${channelId} is not a ${type} channel!`
    );
  logger.info(`✅ Log channel found! (${channel.name})`);
  return channel as T;
};

/**
 * Assert that the bot has all the required permissions
 * @param member
 */
const assertPermissions = async (member: GuildMember, permissions: Map<PermissionResolvable, string>) => {
  for (const [permission, permissionName] of permissions) {
    if (!member.permissions.has(permission))
      throw new Error(`Missing permission ${permissionName}!`);
  }
  logger.info("✅ Bot has all required permissions!");
};

const assertBotMember = async (guild: Guild, client: Client) => {
  if (!client.user) throw new Error("Client user not found!");
  const member = await guild.members.fetch(client.user.id);
  if (!member) {
    throw new Error(
      `Member with ID ${
        client.user!.id
      } not found! (Did you invite the bot to your server?)`
    );
  }
  return member;
};

const assertRole = async (guild: Guild, roleId: string) => {
  const role = await guild.roles.fetch(roleId);
  if (!role) throw new Error(`Role with ID ${roleId} not found but is required!`);
  return role;
}

const assertBotUser = async (client: Client) => {
  const user = await client.users.fetch(config.CLIENT_ID);
  if (!user)
    throw new Error(
      `User with ID ${config.CLIENT_ID} not found! (Did you invite the bot to your server?)`
    );
  logger.info(`✅ Bot is logged in as ${user.tag}!`);
}
