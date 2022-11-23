import { EmbedBuilder } from "discord.js";

export const whitelistEmbed = (profile: { id: string; name: string }) => {
  return new EmbedBuilder()
    .setTitle("Whitelisted")
    .setThumbnail(`https://mc-heads.net/avatar/${profile.id}.png`)
    .addFields([
      {
        name: "uuid",
        value: profile.id,
        inline: false,
      },
      {
        name: "account name",
        value: profile.name,
        inline: false,
      },
    ])
    .setImage(`https://mc-heads.net/body/${profile.id}.png`);
};
