import { GuildMember } from 'discord.js';
import { logger } from "@logger";

export const loggedKick = (member: GuildMember | undefined, reason?: string) => {
  if(!member) return;
  try {
    member.kick();
    logger.discord("info", "kicked " + "`" + member + "`" + " for " + reason);
  } catch {
    logger.discord("warn", "could not kick member `" + member + "`");
  }
}
