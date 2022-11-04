import { Client, Events, Interaction, Message } from "discord.js";
import { ApplicationRejectReason } from "../interfaces/ApplicationRejectReason";
import {
  WhitelistApplication,
  whitelistApplicationSchema,
} from "../interfaces/WhitelistApplication";

export default (client: Client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (
      interaction.isButton() &&
      interaction.customId === "create-application-accepted"
    ) {
      try {
        const application = extractWhitelistApplication(interaction.message);
        if (application) {
          handleAccept(application, interaction);
        }
      } catch (error) {
        console.error(error);
      }
    }
    if (
      interaction.isSelectMenu() &&
      interaction.customId === "create-application-reject"
    ) {
      try {
        const reason = interaction.values[0] as ApplicationRejectReason;
        const application = extractWhitelistApplication(interaction.message);
        if (application) {
          handleReject(application, reason, interaction);
        }
      } catch (error) {
        console.error(error);
      }
    }
  });
};

const handleReject = async (
  application: WhitelistApplication,
  reason: ApplicationRejectReason,
  interaction: Interaction
) => {
  switch (reason) {
    case ApplicationRejectReason.Underage:
      interaction.guild?.members.ban(interaction.user, {
        reason: "underage (discord tos)",
      });
      break;
    case ApplicationRejectReason.NoReasonProvided:
      await (
        await interaction.user.createDM(true)
      ).send(
        "Your application was denied for not providing a reason. Please try again."
      );
      break;
    case ApplicationRejectReason.OffensiveName:
      await (
        await interaction.user.createDM(true)
      ).send(
        "Your application was denied for having an offensive name. Please change your name, rejoin and try again."
      );
      await interaction.guild?.members.kick(interaction.user);
      break;
    case ApplicationRejectReason.BadReason:
      await (
        await interaction.user.createDM(true)
      ).send("Your application was denied.");
      await interaction.guild?.members.ban(interaction.user);
  }
};

const handleAccept = (
  application: WhitelistApplication,
  interaction: Interaction
) => {
  // TODO
};

const extractWhitelistApplication = (message: Message) => {
  const whitelistApplication: Partial<WhitelistApplication> = {};
  for (const field of message.embeds[0].fields) {
    if (field.name === "discord") {
      whitelistApplication.discordUsername === field.value;
    }
    if (field.name === "minecraft uuid") {
      whitelistApplication.minecraftUUID === field.value;
    }
    if (field.name === "discord name") {
      whitelistApplication.discordUsername === field.value;
    }
    if (field.name === "discord id") {
      whitelistApplication.discordID === field.value;
    }
    return whitelistApplicationSchema.parse(whitelistApplication);
  }
};
