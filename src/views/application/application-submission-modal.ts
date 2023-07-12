import {
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

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
          .setLabel("Your age")
          .setRequired(true),
      ),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("reason")
          .setMaxLength(100)
          .setMinLength(1)
          .setStyle(TextInputStyle.Short)
          .setLabel("Reason for joining")
          .setRequired(true),
      ),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("minecraftName")
          .setMaxLength(16)
          .setMinLength(1)
          .setStyle(TextInputStyle.Short)
          .setLabel("Minecraft name (case sensitive)")
          .setRequired(true),
      ),
    ]);
};
