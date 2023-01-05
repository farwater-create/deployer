"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReject = void 0;
const application_reject_reason_1 = require("../../interfaces/application-reject-reason");
const config_1 = require("../../lib/config");
const logger_1 = __importDefault(require("../../lib/logger"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const whitelist_error_offensive_name_1 = __importDefault(require("../../templates/whitelist-error-offensive-name"));
const handleReject = async (user, reason, interaction) => {
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
        case application_reject_reason_1.ApplicationRejectReason.Left: {
            try {
                interaction.message.delete();
                // eslint-disable-next-line no-empty
            }
            catch {
            }
        }
    }
    await prisma_1.default.whitelistApplication.deleteMany({
        where: {
            discordID: user.id,
        },
    });
};
exports.handleReject = handleReject;
