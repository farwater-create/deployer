import { lookupLink } from "@lib/discord/minecraft-lookup";
import { logger } from "@logger";
import { GuildMember, PartialGuildMember } from "discord.js";

export const onUserLeave = async (member: GuildMember | PartialGuildMember) => {
	const result = await lookupLink(
		member.id,
		"discordToMinecraft",
	);

	if (result && result.length > 0) {
		logger.discord("info", `:red_circle: ${member.user.username} (<@${member.id}>) left the server with linked account ${result[0]?.minecraftName}`);
	}
};