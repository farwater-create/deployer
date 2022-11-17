import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
} from "discord.js";

const modal = new ModalBuilder()
  .setTitle("Create Application")
  .setCustomId("create-application");

const ageInput = new TextInputBuilder()
  .setCustomId("age")
  .setMaxLength(2)
  .setMinLength(1)
  .setStyle(TextInputStyle.Short)
  .setLabel("Your age.")
  .setRequired(true);

const reasonInput = new TextInputBuilder()
  .setStyle(TextInputStyle.Paragraph)
  .setCustomId("reason")
  .setLabel("Why do you want to join the server?")
  .setRequired(true);

const minecraftUsername = new TextInputBuilder()
  .setStyle(TextInputStyle.Short)
  .setCustomId("minecraft-username")
  .setLabel("Your minecraft username")
  .setRequired(true)
  .setMinLength(3)
  .setMaxLength(250);

const ageActionRow =
  new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
    ageInput
  );

const reasonActionRow =
  new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
    reasonInput
  );

const minecraftUsernameActionRow =
  new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
    minecraftUsername
  );

modal.addComponents(ageActionRow, reasonActionRow, minecraftUsernameActionRow);

export const WhitelistApplicationModal = modal;
