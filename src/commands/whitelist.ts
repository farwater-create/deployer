import axios from "axios";
import {
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import {
  fetchUsername,
  fetchUUID,
  unwhitelistAccount,
  whitelistAccount,
} from "../lib/minecraft";
import prisma from "../lib/prisma";
import { BotSlashCommand } from "../lib/slash-commands";
import { whitelistEmbed } from "../templates/whitelist-embed";
import { apply } from "./apply";

export const whitelist: BotSlashCommand = {
  json: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("whitelist your minecraft account")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("username")
        .setDescription("new minecraft username")
        .setRequired(true)
    )
    .toJSON(),
  handler: async function (interaction: CommandInteraction): Promise<void> {
    const application = await prisma.whitelistApplication.findFirst({
      where: {
        discordID: interaction.user.id,
      },
    });

    if (!application) {
      apply.handler(interaction);
      return;
    }

    if (application.status != "accepted") {
      await interaction.reply({
        content: "Your application is still awaiting approval.",
        ephemeral: true,
      });
      return;
    }

    const username = `${interaction.options.get("username", true).value}`;
    let profile: {
      id: string;
      name: string;
    };

    try {
      profile = await fetchUUID(username);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(
          `Error fetching uuid - ${error.code}: ${error.response?.data}`
        );
      } else {
        console.log(error);
      }
      await interaction.reply({
        content: "Minecraft account not found.",
        ephemeral: true,
      });
      return;
    }

    const exists = await prisma.whitelistApplication.findFirst({
      where: {
        minecraftUUID: profile.id,
      },
    });

    if (exists?.discordID != interaction.id) {
      await interaction.reply(
        "Someone else already owns that account, nice try."
      );
      return;
    }

    if (application.minecraftUUID === profile.id) {
      await interaction.deferReply();
      await interaction.followUp({
        content:
          "Attempting to rewhitelist. Please be patient while the server handles your request.",
        ephemeral: true,
      });
      try {
        await whitelistAccount(profile.name);
        await interaction.followUp({
          embeds: [whitelistEmbed(profile).setTitle("Whitelist")],
          ephemeral: true,
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          await interaction.followUp("Something went wrong. Is the server up?");
        } else {
          console.log(error);
        }
      }
      return;
    }

    const oldAccountProfile = await fetchUsername(application.minecraftUUID);
    try {
      await interaction.deferReply();
      await unwhitelistAccount(oldAccountProfile.name);
      await interaction.followUp({
        embeds: [
          whitelistEmbed(oldAccountProfile).setTitle("Removed From Whitelist"),
        ],
        ephemeral: true,
      });
      await whitelistAccount(profile.name);
      await prisma.whitelistApplication.updateMany({
        where: {
          discordID: interaction.id,
        },
        data: {
          minecraftUUID: profile.id,
        },
      });
      await interaction.followUp({
        embeds: [whitelistEmbed(profile)],
        ephemeral: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error))
        await interaction.followUp("Something went wrong. Is the server up?");
      else console.log(error);
    }
  },
};
