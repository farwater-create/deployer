import { Client, Events, TextChannel } from "discord.js";
import {
  adminApplicationEmbed,
  adminApplicationEmbedComponents,
} from "../templates/admin-application-message";

const fetchUUID = async (
  name: string
): Promise<{ name: string; id: string }> => {
  return fetch(`https://api.mojang.com/profiles/minecraft/${name}`)
    .then((resp) => resp.json())
    .then(
      (data) =>
        data as {
          name: string;
          id: string;
        }
    );
};

const APPLICATION_PENDING_CHANNEL = "1013541292300582922";

export default (client: Client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== "create-application") return;

    const age = interaction.fields.getTextInputValue("age");
    const reason = interaction.fields.getTextInputValue("reason");
    const minecraftUsername =
      interaction.fields.getTextInputValue("minecraft-username");
    const profile = await fetchUUID(minecraftUsername);

    await interaction.followUp({
      ephemeral: true,
      content: "your application has been submitted",
    });

    const adminApplicationChannel = interaction.client.channels.cache.get(
      APPLICATION_PENDING_CHANNEL
    ) as TextChannel;

    await adminApplicationChannel.send({
      embeds: [
        adminApplicationEmbed({
          discordID: interaction.user.id,
          discordUsername: interaction.user.username,
          minecraftUUID: profile.id,
          age,
          reason,
        }),
      ],
      components: adminApplicationEmbedComponents,
    });
  });
};
