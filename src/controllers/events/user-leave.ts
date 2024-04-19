import { FarwaterUser } from "@controllers/users/farwater-user";
import { lookupLink } from "@lib/discord/minecraft-lookup";
import { logger } from "@logger";
import { MinecraftApplicationReviewStatus } from "@models/application/application";
import { GuildMember, PartialGuildMember } from "discord.js";

export const onUserLeave = async (member: GuildMember | PartialGuildMember) => {
	const result = await lookupLink(
		member.id,
		"discordToMinecraft",
	);

	if (result && result.length > 0) {
		const fw = await FarwaterUser.fromDiscordId(member.client, member.id);
		if (!fw) return;

		await fw.unwhitelistAll().catch((e) => logger.discord("error", "Failed to unwhitelist user on leave: " + e));

		// const apps = await fw.getMinecraftApplications();
		// if (!apps) return;

		// apps?.forEach(async (app) => {
		// 	await fw.unwhitelist(app.getOptions().serverId).catch((e) => logger.discord("error", "Failed to unwhitelist user on leave: " + e));
		// });
		logger.discord("info", `:red_circle: ${member.user.username} (<@${member.id}>) left the server with linked account **${result[0]?.minecraftName}**.`);
	}
};