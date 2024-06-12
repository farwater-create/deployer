import { FarwaterUser } from "@controllers/users/farwater-user";
import { lookupLink } from "@lib/discord/minecraft-lookup";
import { logger } from "@logger";
import { GuildMember, PartialGuildMember } from "discord.js";

export const onMemberRoleUpdate = async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember | PartialGuildMember) => {
	const donationRoles = ['enchanted', 'arcane', 'mystic', 'server booster'];
	const oldRoles = oldMember.roles.cache.map(role => role.name.toLowerCase());
	const newRoles = newMember.roles.cache.map(role => role.name.toLowerCase());

	const addedRole = donationRoles.find(role => !oldRoles.includes(role) && newRoles.includes(role));
	const removedRole = donationRoles.find(role => oldRoles.includes(role) && !newRoles.includes(role));

	const result = await lookupLink(newMember.id, "discordToMinecraft");

	if (result && result.length > 0) {
		const fw = await FarwaterUser.fromDiscordId(newMember.client, newMember.id);
		if (!fw) return;

		if (addedRole) {
			fw.addRole(addedRole).catch((e) => logger.discord("error", "Failed to add role to user: " + e));
			logger.discord("info", `:rocket: <@${newMember.id}> **(${result[0]?.minecraftName})** purchased/got the **${addedRole}** role.`);
		}

		if (removedRole) {
			fw.removeRole(removedRole).catch((e) => logger.discord("error", "Failed to remove role from user: " + e));
			logger.discord("info", `:exclamation: <@${newMember.id}> **(${result[0]?.minecraftName})** lost the **${removedRole}** role.`);
		}
	}
};
