import { FarwaterUser } from "@controllers/users/farwater-user";
import { MinecraftApplicationModal } from "@views/application/minecraft-application-submit-modal";
import { ButtonInteraction } from "discord.js";

export const handleMinecraftApplicationModalApplyButtonPress = async (interaction: ButtonInteraction) => {
    const serverId = interaction.message.embeds[0].fields.find((f) => f.name === "serverId")?.value;
    if (!serverId) return;

    const fw = await FarwaterUser.fromDiscordId(interaction.client, interaction.user.id);
    const app = await fw.getMinecraftApplicationByServerId(serverId);

    if (app && app.getOptions().status != "rejected" && fw.getOptions().minecraftName != null) {
        const content = `Your application is currently **${app.getOptions().status
            }**. You have already applied for this server.`;

        interaction.reply({
            ephemeral: true,
            content,
        });
        return;
    }

    interaction.showModal(MinecraftApplicationModal());
};
