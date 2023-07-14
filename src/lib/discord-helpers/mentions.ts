import { RoleResolvable, UserResolvable } from "discord.js";

export const userToMentionString = (user: UserResolvable ) => {
  return `<@!${user.toString()}>`;
}

export const roleToMentionString = (role: RoleResolvable) => {
  return `<@&${role.toString()}>`;
}
