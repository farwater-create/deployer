import { Client, Events, TextChannel } from "discord.js";
import { config } from "../lib/config";
import { fetchUUID } from "../lib/minecraft";
import prisma from "../lib/prisma";
import {
  adminApplicationEmbed,
  adminApplicationEmbedComponents,
} from "../templates/admin-application-message";

export default (client: Client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== "create-application") return;

    let age: number;
    try {
      age = Number.parseInt(interaction.fields.getTextInputValue("age"));
      if (Number.isNaN(age)) {
        throw new TypeError("age is not a number");
      }
      if (!Number.isInteger(age)) {
        throw new TypeError("age is not an int");
      }
    } catch {
      await interaction.reply({
        ephemeral: true,
        content: "Age must be a valid number.",
      });
      return;
    }

    const reason = interaction.fields.getTextInputValue("reason");
    const minecraftUsername =
      interaction.fields.getTextInputValue("minecraft-username");

    let profile: { name: string; id: string };
    try {
      profile = await fetchUUID(minecraftUsername);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        ephemeral: true,
        content: "Could not find minecraft username, please apply again.",
      });
      return;
    }

    const whitelistApplicationData = {
      discordID: interaction.user.id,
      reason,
      age,
      minecraftUUID: profile.id,
      status: "pending",
    };

    console.log("Recieved application: \n", whitelistApplicationData);

    const whitelistApplication = await prisma.whitelistApplication.create({
      data: whitelistApplicationData,
    });

    await interaction.reply({
      ephemeral: true,
      content: "Your application has been submitted",
    });

    const adminApplicationChannel = interaction.client.channels.cache.get(
      config.APPLICATION_PENDING_CHANNEL
    ) as TextChannel;

    await adminApplicationChannel.send({
      embeds: [adminApplicationEmbed(whitelistApplication, interaction.user)],
      components: adminApplicationEmbedComponents(whitelistApplication.id),
    });
  });
};
