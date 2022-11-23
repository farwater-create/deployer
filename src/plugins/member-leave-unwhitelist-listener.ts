import { Client } from "discord.js";
import { fetchUsername, unwhitelistAccount } from "../lib/minecraft";
import prisma from "../lib/prisma";

const deleteUserHandler = async (id: string) => {
  try {
    const application = await prisma.whitelistApplication.findFirst({
      where: {
        discordID: id,
      },
    });
    if (!application) return;
    const profile = await fetchUsername(application.minecraftUUID);
    await unwhitelistAccount({ uuid: id, name: profile.name });
    await prisma.whitelistApplication.deleteMany({
      where: {
        discordID: id,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

export default (client: Client) => {
  client.on("guildMemberRemove", (member) => deleteUserHandler(member.user.id));
  client.on("guildBanAdd", (ban) => deleteUserHandler(ban.user.id));
};
