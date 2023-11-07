import {
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export enum MinecraftApplicationModalEvent {
  Submit = "minecraft-application-model-submit"
}

const AGE_DESCRIPTION = "Age in years";
const REASON_DESCRIPTION = "Reason for joining.";
const MINECRAFT_NAME_DESCRIPTION =
  "Minecraft name. (case sensitive)";
const REFERRAL_DESCRIPTION =
  "Referall (optional)";

export const MinecraftApplicationModal = () => {
  return new ModalBuilder()
    .setTitle("Whitelist Application")
    .setCustomId(MinecraftApplicationModalEvent.Submit)
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
    ]);
};
