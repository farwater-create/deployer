"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const application_reject_reason_1 = require("../interfaces/application-reject-reason");
const config_1 = require("../lib/config");
const logger_1 = __importDefault(require("../lib/logger"));
const minecraft_1 = require("../lib/minecraft");
const prisma_1 = __importDefault(require("../lib/prisma"));
const admin_application_log_embed_1 = require("../templates/admin-application-log-embed");
const getting_started_1 = __importDefault(require("../templates/getting-started"));
const whitelist_embed_1 = require("../templates/whitelist-embed");
const whitelist_error_offensive_name_1 = __importDefault(require("../templates/whitelist-error-offensive-name"));
const ACCESS_CREATE_ROLE = "795578910221664266";
exports.default = (client) => {
    client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
        const logChannel = interaction.client.channels.cache.get(config_1.config.APPLICATION_LOG_CHANNEL) ||
            (await interaction.client.channels.fetch(config_1.config.APPLICATION_LOG_CHANNEL));
        try {
            // Accept Handler
            if (interaction.isButton() &&
                interaction.customId.startsWith("create-application-accept:")) {
                const application = await prisma_1.default.whitelistApplication.findUnique({
                    where: {
                        id: interaction.customId.split(":")[1],
                    },
                });
                if (!application) {
                    await interaction.reply("User has left the server...");
                    return;
                }
                try {
                    handleAccept(application, interaction);
                    const user = client.users.cache.get(application.discordID) ||
                        (await client.users.fetch(application.discordID));
                    await logChannel.send({
                        embeds: [
                            (0, admin_application_log_embed_1.adminApplicationLogEmbed)(application, user, interaction.user, "accepted"),
                        ],
                    });
                    await interaction.message.delete();
                }
                catch (error) {
                    logger_1.default.error(error);
                    await interaction.message.delete();
                    await prisma_1.default.whitelistApplication.delete({
                        where: {
                            id: application.id,
                        },
                    });
                }
            }
            // Reject Handler
            if (interaction.isSelectMenu() &&
                interaction.customId.startsWith("create-application-reject:")) {
                const application = await prisma_1.default.whitelistApplication.findUnique({
                    where: {
                        id: interaction.customId.split(":")[1],
                    },
                });
                if (!application)
                    return;
                try {
                    const user = interaction.client.users.cache.get(application.discordID) ||
                        (await interaction.client.users.fetch(application.discordID));
                    if (!user)
                        return;
                    const reason = interaction.values[0];
                    await handleReject(user, reason);
                    await logChannel.send({
                        embeds: [
                            (0, admin_application_log_embed_1.adminApplicationLogEmbed)(application, user, interaction.user, "rejected", interaction.values[0]),
                        ],
                    });
                    await interaction.message.delete();
                }
                catch (error) {
                    logger_1.default.error(error);
                    await prisma_1.default.whitelistApplication.delete({
                        where: {
                            id: application.id,
                        },
                    });
                }
            }
        }
        catch (error) {
            await logChannel.send(`${JSON.stringify(error, undefined, 2)}`);
        }
    });
};
const handleReject = async (user, reason) => {
    const whitelistChannel = user.client.channels.cache.get(config_1.config.APPLICATIONS_ACCEPTED_CHANNEL) ||
        (await user.client.channels.fetch(config_1.config.APPLICATIONS_ACCEPTED_CHANNEL));
    if (!whitelistChannel || !whitelistChannel.isTextBased()) {
        logger_1.default.error("whitelist channel not found");
        return;
    }
    switch (reason) {
        case application_reject_reason_1.ApplicationRejectReason.Underage: {
            await whitelistChannel.send(`<@${user.id}> Your create application was denied for breaking discord terms of service. You must be at least thirteen years old.`);
            break;
        }
        case application_reject_reason_1.ApplicationRejectReason.NoReasonProvided: {
            await whitelistChannel.send(`<@${user.id}> Your create application was denied for not providing a valid reason. Please try again.`);
            break;
        }
        case application_reject_reason_1.ApplicationRejectReason.OffensiveName: {
            await whitelistChannel.send(whitelist_error_offensive_name_1.default);
            break;
        }
        case application_reject_reason_1.ApplicationRejectReason.BadAccount: {
            await whitelistChannel.send(`<@${user.id}> Your application was denied.`);
            break;
        }
        case application_reject_reason_1.ApplicationRejectReason.BadReason: {
            await whitelistChannel.send(`<@${user.id}> Your application was denied.`);
            break;
        }
        case application_reject_reason_1.ApplicationRejectReason.Suspended: {
            await whitelistChannel.send(`<@${user.id}> Your application was denied because applications are suspended.
        Please try again at a later date. Check the announcements channel for more information.`);
            break;
        }
    }
    await prisma_1.default.whitelistApplication.deleteMany({
        where: {
            discordID: user.id,
        },
    });
};
const handleAccept = async (application, interaction) => {
    // update database
    try {
        await prisma_1.default.whitelistApplication.update({
            where: {
                id: application.id,
            },
            data: {
                status: "accepted",
            },
        });
        const account = await (0, minecraft_1.fetchUsername)(application.minecraftUUID);
        await (0, minecraft_1.whitelistAccount)({
            name: account.name,
            uuid: account.id,
        });
    }
    catch (error) {
        logger_1.default.error(error);
    }
    // fetch role
    const accessCreateRole = await interaction.guild?.roles.fetch(ACCESS_CREATE_ROLE);
    if (!accessCreateRole) {
        logger_1.default.error("create role not found");
        return;
    }
    // fetch user info
    let user = interaction.client.users.cache.get(application.discordID);
    if (!user)
        user = await interaction.client.users.fetch(application.discordID);
    if (!user) {
        logger_1.default.error("could not fetch user " + application.discordID);
        return;
    }
    const member = interaction.guild?.members.cache.get(application.discordID);
    if (!member)
        return;
    // add create role
    try {
        await interaction.guild?.members.addRole({
            user: member,
            role: accessCreateRole,
            reason: "application accepted",
        });
    }
    catch (error) {
        logger_1.default.error(error);
        return;
    }
    try {
        const profile = await (0, minecraft_1.fetchUsername)(application.minecraftUUID);
        const applicationsAcceptedChannel = interaction.client.channels.cache.get(config_1.config.APPLICATIONS_ACCEPTED_CHANNEL) ||
            (await interaction.client.channels.fetch(config_1.config.APPLICATIONS_ACCEPTED_CHANNEL));
        if (!applicationsAcceptedChannel ||
            !applicationsAcceptedChannel.isTextBased()) {
            logger_1.default.error("applications channel not found");
            return;
        }
        const embed = (0, whitelist_embed_1.whitelistEmbed)(profile);
        embed.setDescription(`${getting_started_1.default}\n<@${application.discordID}>`);
        await applicationsAcceptedChannel.send({
            embeds: [embed],
        });
        (await user.createDM(true)).send({
            embeds: [embed],
        });
    }
    catch (error) {
        logger_1.default.error(error);
    }
};
