import { lookupLink } from "@lib/discord/minecraft-lookup";
import { logger } from "@logger";
import { GuildMember, PartialGuildMember } from "discord.js";

export const onUserLeave = async (member: GuildMember | PartialGuildMember) => {
	const link = await lookupLink(member.id, "discordToMinecraft");

	if (link && link[0].minecraftName) {
		logger.discord("info", `:red_circle: ${member.user.username} (<@${member.id}>) left the server with linked account ${link[0].minecraftName}`);
	}
};