import { EmbedBuilder, User } from "discord.js";

export function userEmbed(
  minecraftUser: {
    name: string;
    id: string;
  },
  user: User,
  applicationStatus?: string
) {
  const embed = new EmbedBuilder()
    .setTitle(`${user.username}'s Create Profile`)
    .addFields([
      {
        name: "minecraft",
        value: minecraftUser.name,
        inline: false,
      },
      {
        name: "minecraft_uuid",
        value: minecraftUser.id,
        inline: false,
      },
      {
        name: "discord",
        value: `<@${user.id}>`,
        inline: false,
      },
      {
        name: "discord_id",
        value: user.id,
        inline: false,
      },
    ])
    .setThumbnail(
      user.avatarURL() ||
        `https://crafatar.com/renders/head/${minecraftUser.id}`
    )
    .setImage(`https://mc-heads.net/body/${minecraftUser.id}.png`);
  if (applicationStatus) {
    embed.addFields({
      name: "application status",
      value: applicationStatus,
      inline: false,
    });
  }
  return embed;
}
