import {config} from "@config";
import {FarwaterUser} from "@controllers/users/farwater-user";
import {logger} from "@logger";
import {MinecraftApplicationReviewStatus} from "@models/application/application";
import {MinecraftApplicationRejectReason, minecraftApplicationRejectReasons} from "@models/application/reject-reasons";
import {MinecraftApplicationDecisionMessageOptions} from "@views/application/minecraft-application-decision-message";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Colors,
    EmbedBuilder,
    MessageEditOptions,
    StringSelectMenuInteraction,
} from "discord.js";
import {MinecraftApplication} from "./application";

export const handleMinecraftApplicationDecisionMessageStringSelectMenu = async (
    interaction: StringSelectMenuInteraction,
) => {
    const value = interaction.values[0] as MinecraftApplicationRejectReason;
    let application: MinecraftApplication | undefined;
    let farwaterUser: FarwaterUser | undefined;

    try {
        application = MinecraftApplication.fromMinecraftApplicationDecisionMessage(interaction.message);
        farwaterUser = await application.getFarwaterUser();
    } catch (error) {
        logger.error(error);
        return;
    }
    if (!application) return;
    if (!farwaterUser) return;

    await application.updateStatus(MinecraftApplicationReviewStatus.Rejected);

    const {discordId} = application.getOptions();
    const guild = interaction.client.guilds.cache.get(config.GUILD_ID);
    if (!guild) {
        throw new Error("guild not found");
    }
    const rejectReasonDescription = minecraftApplicationRejectReasons[value];
    const user = await interaction.client.users.fetch(discordId);
    if (!user) return;
    const dmChannel = await user.createDM(true);

    try {
        const reply = `Your farwater application was denied for reason: \`${rejectReasonDescription}\`.`;
        let footnotes: string | undefined;
        switch (value) {
            case "otherBannable":
                break;
            case "underage":
                break;
            case "offensiveApplication":
                footnotes = "Create a ticket if you wish to re-apply with an apology.";
                break;
            case "offensiveDiscordUser":
                footnotes = "Create a ticket if you wish to re-apply with an apology.";
                break;
            case "offensiveMinecraftSkin":
                await application.getFarwaterUser().then((a) => a?.flagOffensiveSkin());
                footnotes = "Create a ticket if you wish to re-apply with an apology.";
                break;
            case "userLeftDiscordServer":
                break;
            case "noMinecraftAccount":
                footnotes = "Double check your Minecraft name (case sensitive) and apply again.";
                break;
            case "invalidAge":
                footnotes = "Please enter a valid age when re-applying.";
                break;
            default:
            case "lowEffortApplication":
                footnotes = "Please provide more reasons for why you want to join farwater then apply again.";
                break;
        }
        await dmChannel.send(`${reply}\n${footnotes || ""}`);
    } catch (error) {
        logger.discord("warn", "Tried to send dm to user " + user.id + " but user has dms closed.");
    }

    const messageEditOptions = MinecraftApplicationDecisionMessageOptions(
        application.getOptions(),
        farwaterUser.getOptions(),
        {
            status: MinecraftApplicationReviewStatus.Rejected,
            reason: value,
        },
        interaction.user,
    ) as MessageEditOptions;

    const message = await interaction.message
        .edit({
            ...messageEditOptions,
            components: [],
        })
        .catch((err) => logger.error(err));
    if (!message) return;

    await interaction
        .reply({
            ephemeral: true,
            content: `Rejected application. Remember to take the appropriate administrative action.`,
        })
        .catch((err) => logger.error(err));

    await interaction.message
        .edit({
            embeds: interaction.message.embeds.map((embed) => new EmbedBuilder(embed.data).setColor(Colors.Red)),
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId("rejectedstatus")
                        .setLabel("Rejected - " + value)
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                ),
            ],
        })
        .catch(logger.error);
};
