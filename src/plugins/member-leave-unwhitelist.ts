import { Client } from "discord.js";
import { fetchUsername, unwhitelistAccount } from "../lib/minecraft";
import prisma from "../lib/prisma";

const deleteUserHandler = async (id: string) => {
  const application = await prisma.WhitelistApplication.findFirst({
    where: {
      discordID: id,
    },
  });
  if (!application) return;
  const profile = await fetchUsername(application.minecraftUUID);
  await unwhitelistAccount({ uuid: id, name: profile.name });
};

export default (client: Client) => {
  client.on("guildMemberRemove", (member) => deleteUserHandler(member.user.id));
  client.on("guildBanAdd", (ban) => deleteUserHandler(ban.user.id));
};
