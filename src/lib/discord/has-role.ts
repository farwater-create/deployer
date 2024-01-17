import {Message} from "discord.js";

export const messageHasRole = (message: Message, role: string): boolean => {
    return message.member?.roles.cache.has(role) ?? false;
};
