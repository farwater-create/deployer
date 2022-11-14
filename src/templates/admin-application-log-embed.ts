import { WhitelistApplication } from "@prisma/client";
import { Colors, EmbedBuilder, User } from "discord.js";

export function adminApplicationLogEmbed(
  application: WhitelistApplication,
  user: User,
  status: "accepted" | "rejected",
  reason?: string
) {
  const embed = new EmbedBuilder()
    .setTitle(`${user.username}'s Create Application`)
    .addFields([
      {
        name: "age",
        value: `${application.age}`,
      },
      {
        name: "reason",
        value: `${application.reason}`,
      },
      {
        name: "application_id",
        value: application.id,
      },
      {
        name: "minecraft_uuid",
        value: application.minecraftUUID,
        inline: false,
      },
      {
        name: "discord",
        value: `<@${user.id}>`,
        inline: false,
      },
      {
        name: "discord_id",
        value: application.discordID,
        inline: false,
      },
      {
        name: "status",
        value: status,
        inline: false,
      },
    ])
    .setThumbnail(user.displayAvatarURL() || user.defaultAvatarURL);
  switch (status) {
    case "accepted": {
      embed.setColor(Colors.Green);
      break;
    }
    case "rejected": {
      embed.setColor(Colors.Red);
      break;
    }
  }
  if (reason) {
    embed.addFields([
      {
        name: "denied for",
        value: `${reason}`,
      },
    ]);
  }
  return embed;
}
