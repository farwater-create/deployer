import { GuildMember } from 'discord.js';
import { logger } from "@logger";

export const loggedKick = (member: GuildMember | undefined, reason?: string) => {
  if(!member) return;
  member.kick()
  .catch(error => logger.discord("warn", "could not kick member `" + member + "` " + error))
  .then(_ => logger.discord("info", "kicked " + "`" + member + "`" + " for " + reason));
}
