import { Message } from "discord.js"

export const toMessageLink = (message:Message) => {
  const { channelId, id, guildId } = message;
  return `https://discord.com/channels/${guildId}/${channelId}/${id}`
}
