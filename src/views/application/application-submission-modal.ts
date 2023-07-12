import {
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

const AGE_DESCRIPTION = "Please enter your age in years.";
const REASON_DESCRIPTION = "Please enter a reason for joining.";
const MINECRAFT_NAME_DESCRIPTION = "Please enter your Minecraft name. (case sensitive)";
const REFERRAL_DESCRIPTION = "Please enter the name of the person who referred you. (optional)";

export const ApplicationSubmissionModal = () => {
  return new ModalBuilder()
    .setTitle("Whitelist Application")
    .setCustomId("application:submit")
    .addComponents([
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("age")
          .setMaxLength(2)
          .setMinLength(1)
          .setStyle(TextInputStyle.Short)
          .setLabel(AGE_DESCRIPTION)
          .setRequired(true),
      ),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("reason")
          .setMaxLength(100)
          .setMinLength(1)
          .setStyle(TextInputStyle.Paragraph)
          .setLabel(REASON_DESCRIPTION)
          .setRequired(true),
      ),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("minecraftName")
          .setMaxLength(16)
          .setMinLength(1)
          .setStyle(TextInputStyle.Short)
          .setLabel(MINECRAFT_NAME_DESCRIPTION)
          .setRequired(true),
      ),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("referral")
          .setMaxLength(16)
          .setMinLength(1)
          .setStyle(TextInputStyle.Short)
          .setLabel(REFERRAL_DESCRIPTION)
          .setRequired(false),
      ),
    ])
};
