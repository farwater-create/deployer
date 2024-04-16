import { lookupLink } from "@lib/discord/minecraft-lookup";
import { logger } from "@logger";
import { GuildMember } from "discord.js";

export const onUserJoin = async (member: GuildMember) => {
	const result = await lookupLink(
		member.id,
		"discordToMinecraft",
	);
	if (result && result.length > 0) {
		logger.discord("info", `:green_circle: ${member.user.username} (<@${member.id}>) rejoined the server with linked account ${result[0]?.minecraftName}`);
	}
};