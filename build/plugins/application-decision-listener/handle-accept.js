"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAccept = void 0;
const config_1 = require("../../lib/config");
const logger_1 = __importDefault(require("../../lib/logger"));
const minecraft_1 = require("../../lib/minecraft");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const roles_1 = require("../../lib/roles");
const getting_started_1 = __importDefault(require("../../templates/getting-started"));
const whitelist_embed_1 = require("../../templates/whitelist-embed");
const handleAccept = async (application, interaction) => {
    // update database
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
    // fetch role
    const accessCreateRole = await interaction.guild?.roles.fetch(roles_1.ACCESS_CREATE_ROLE);
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
    await interaction.guild?.members.addRole({
        user: member,
        role: accessCreateRole,
        reason: "application accepted",
    });
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
    // eslint-disable-next-line unicorn/no-await-expression-member
    (await user.createDM(true)).send({
        embeds: [embed],
    });
};
exports.handleAccept = handleAccept;
