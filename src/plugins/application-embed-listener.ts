import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Events,
} from "discord.js";
import { config } from "../lib/config";
import prisma from "../lib/prisma";
import { WhitelistApplicationModal } from "../templates/whitelist-application-modal";

export default async (client: Client) => {
  console.log("started application-embed-listener");
  const channel =
    client.channels.cache.get(config.APPLICATIONS_CHANNEL) ||
    (await client.channels.fetch(config.APPLICATIONS_CHANNEL));
  if (!channel) {
    throw new Error("channel not found: " + config.APPLICATIONS_CHANNEL);
  }
  if (!channel.isTextBased()) {
    throw new Error(
      "invalid applications channel: " + config.APPLICATIONS_CHANNEL
    );
  }
  const messages = await channel.messages.fetch({ limit: 1 });
  const message = messages.first();
  const isMessageEmbed =
    message?.author.bot && message.author.id === client.user?.id;
  if (!isMessageEmbed) {
    console.log("recreating applications embed");
    channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("Farwater Create Applications")
          .setDescription(
            'Please read the rules @ <#1020403465643638894> Click "Apply" to apply.'
          )
          .setThumbnail(
            "https://gitea.kamaii.xyz/humbertovnavarro/season-7-modpack/raw/branch/main/overrides/background.png"
          ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("create-application-apply")
            .setLabel("Apply")
            .setStyle(ButtonStyle.Primary)
        ),
      ],
    });
  } else {
    console.log("last message is from bot, assuming it exists");
  }
  client.on(Events.InteractionCreate, async (interaction) => {
    if (
      interaction.isButton() &&
      interaction.customId.startsWith("create-application-apply")
    ) {
      const application = await prisma.whitelistApplication.findFirst({
        where: {
          discordID: interaction.user.id,
        },
      });
      if (application) {
        await interaction.reply({
          content: "You've already submitted an application",
          ephemeral: true,
        });
        return;
      }
      await interaction.showModal(WhitelistApplicationModal);
    }
  });
};
