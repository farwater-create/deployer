import { userToMentionString } from "@lib/discord-helpers/mentions";
import { ApplicationCallback } from "@models/application-callback-id";
import { ApplicationModel } from "@models/application-model";
import { ApplicationRejectReasons } from "@models/application-rejection-reasons";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageCreateOptions, SelectMenuBuilder, StringSelectMenuBuilder } from "discord.js";

const ApplicationDecisionEmbed = ({
  discordId,
  age,
  reason,
  minecraftName,
  minecraftUuid,
}: ApplicationModel) => {
  const embed = new EmbedBuilder()
    .setTitle("Whitelist Application")
    .setDescription(
      reason
    )
    .addFields([
      {
        name: "age",
        value: age,
      },
      {
        name: "discord",
        value: userToMentionString(discordId),
      },
      {
        name: "discordId",
        value: discordId,
      },
      {
        name: "minecraftName",
        value: minecraftName,
      },
      {
        name: "minecraftUuid",
        value: minecraftUuid,
      }
    ])
    .setThumbnail(`https://mc-heads.net/body/${minecraftName}.png`)
    .setImage(`https://mc-heads.net/body/${minecraftName}.png`);
    return embed;
};

export const ApplicationDecisionMessage = (application: ApplicationModel) => {
  const opts: MessageCreateOptions = {
    embeds: [ApplicationDecisionEmbed(application)],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(ApplicationCallback.Accept)
          .setLabel("Accept")
          .setStyle(ButtonStyle.Success)
      ),
      new ActionRowBuilder<SelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(ApplicationCallback.Reject)
          .addOptions(ApplicationRejectReasons)
          .setPlaceholder("Reject with reason")
      ),
    ],
  };
  return opts;
};
