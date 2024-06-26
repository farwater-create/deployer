import { FarwaterUser } from "@controllers/users/farwater-user";
import { lookupLink } from "@lib/discord/minecraft-lookup";
import { logger } from "@logger";
import { MinecraftApplicationReviewStatus } from "@models/application/application";
import { GuildMember } from "discord.js";

export const onUserJoin = async (member: GuildMember) => {
	const result = await lookupLink(
		member.id,
		"discordToMinecraft",
	);

	if (result && result.length > 0) {
		const fw = await FarwaterUser.fromDiscordId(member.client, member.id);
		if (!fw) return;

		const apps = await fw.getMinecraftApplications();
		if (!apps) return;

		apps?.forEach(async (app) => {
			if (app.getOptions().status === MinecraftApplicationReviewStatus.Accepted) {
				await member.roles.add(app.getOptions().roleId);
			}
			await fw.whitelist(app.getOptions().serverId).catch((e) => logger.discord("error", "Failed to whitelist user on join: " + e));
		});

		logger.discord("info", `:green_circle: ${member.user.username} (<@${member.id}>) rejoined the server with linked account **${result[0]?.minecraftName}**.`);
	}
};