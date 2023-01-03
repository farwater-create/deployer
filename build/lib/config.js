"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const assertEnvironment = (key, defaultValue) => {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`${key} is undefined`);
    }
    return value;
};
exports.config = {
    ADMIN_ROLE: assertEnvironment("ADMIN_ROLE", "782936226013118494"),
    DISCORD_TOKEN: assertEnvironment("DISCORD_TOKEN"),
    PTERO_TOKEN: assertEnvironment("PTERO_TOKEN"),
    PTERO_SERVER_ID: assertEnvironment("PTERO_SERVER_ID"),
    PTERO_SERVER: assertEnvironment("PTERO_SERVER"),
    APPLICATION_PENDING_CHANNEL: assertEnvironment("APPLICATION_PENDING_CHANNEL", "1013541292300582922"),
    DISCORD_CLIENT_ID: assertEnvironment("DISCORD_CLIENT_ID"),
    DISCORD_GUILD_ID: assertEnvironment("DISCORD_GUILD_ID", "638990243587948555"),
    APPLICATION_LOG_CHANNEL: assertEnvironment("APPLICATION_LOG_CHANNEL", "1013558339227099236"),
    APPLICATIONS_CHANNEL: assertEnvironment("APPLICATIONS_CHANNEL", "1013903561391874078"),
    APPLICATIONS_ACCEPTED_CHANNEL: assertEnvironment("APPLICATIONS_ACCEPTED_CHANNEL", "1044731747260190790"),
};
