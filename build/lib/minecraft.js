"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwhitelistAccount = exports.whitelistAccount = exports.fetchUsername = exports.fetchUUID = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("./logger"));
const execute_command_1 = require("./ptero/execute-command");
const fs_1 = require("./ptero/fs");
const fetchUUID = async (name) => {
    const resp = await axios_1.default.get(`https://api.mojang.com/users/profiles/minecraft/${name}`);
    if (resp.status != 200) {
        throw new Error(`${name} not found`);
    }
    return resp.data;
};
exports.fetchUUID = fetchUUID;
const fetchUsername = async (uuid) => {
    const resp = await axios_1.default.get(`https://api.mojang.com/user/profile/${uuid}`);
    if (resp.status != 200) {
        throw new Error(`${uuid} not found`);
    }
    return resp.data;
};
exports.fetchUsername = fetchUsername;
const whitelistAccount = async (account) => {
    logger_1.default.info("whitelisting " + account.name);
    try {
        await (0, execute_command_1.executeCommand)("whitelist add " + account.name);
    }
    catch {
        const whitelistBuffer = await fs_1.PteroFS.readFile("whitelist.json");
        const whitelistJSON = whitelistBuffer.toString("utf8");
        const whitelist = JSON.parse(whitelistJSON);
        let exists = false;
        for (const entry of whitelist) {
            if (entry.uuid === account.uuid || account.name === entry.name) {
                exists = true;
            }
        }
        if (exists) {
            return;
        }
        whitelist.push(account);
        const buffer = Buffer.from(JSON.stringify(whitelist, undefined, 2), "utf8");
        fs_1.PteroFS.writeFile("whitelist.json", buffer);
    }
};
exports.whitelistAccount = whitelistAccount;
const unwhitelistAccount = async (account) => {
    try {
        await (0, execute_command_1.executeCommand)("whitelist remove " + account.name);
    }
    catch {
        const whitelistBuffer = await fs_1.PteroFS.readFile("whitelist.json");
        const whitelistJSON = whitelistBuffer.toString("utf8");
        let whitelist = JSON.parse(whitelistJSON);
        whitelist = whitelist.filter((item) => item.uuid != account.uuid && item.name != account.name);
        const buffer = Buffer.from(JSON.stringify(whitelist, undefined, 2), "utf8");
        fs_1.PteroFS.writeFile("whitelist.json", buffer);
    }
};
exports.unwhitelistAccount = unwhitelistAccount;
