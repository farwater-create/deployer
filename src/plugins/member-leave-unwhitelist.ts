import { Client } from "discord.js";
import { fetchUsername, unwhitelistAccount } from "../lib/minecraft";
import prisma from "../lib/prisma";

export default (client: Client) => {
  client.on("guildMemberRemove", async (member) => {
    const application = await prisma.whitelistApplication.findFirst({
      where: {
        discordID: member.id,
      },
    });
    if (!application) return;
    const profile = await fetchUsername(application.minecraftUUID);
    await unwhitelistAccount(profile.name);
  });
};
