import { lookupLink } from "@lib/discord/minecraft-lookup";
import { logger } from "@logger";
import { GuildMember } from "discord.js";

export const onUserJoin = async (member: GuildMember) => {
	const link = await lookupLink(member.id, "discordToMinecraft");

	if (link && link[0].minecraftName) {
		logger.discord("info", `:green_circle: ${member.user.username} (<@${member.id}>) rejoined the server with linked account ${link[0].minecraftName}`);
	}
};