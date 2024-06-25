import { MinecraftApplicationCustomId } from "@models/application/application";
import {
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";

const MINECRAFT_NAME_DESCRIPTION = "Minecraft name. (case sensitive)";
const AGE_DESCRIPTION = "Age in years";
const REFERRAL_DESCRIPTION = "Referall (optional)";

export const MinecraftApplicationModal = () => {
    return new ModalBuilder()
        .setTitle("Whitelist Application")
        .setCustomId(MinecraftApplicationCustomId.Submit)
        .addComponents([
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
                    .setCustomId("age")
                    .setMaxLength(2)
                    .setMinLength(1)
                    .setStyle(TextInputStyle.Short)
                    .setLabel(AGE_DESCRIPTION)
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
