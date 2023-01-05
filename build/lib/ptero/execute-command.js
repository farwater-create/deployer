"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCommand = void 0;
const config_1 = require("../config");
const client_1 = require("./client");
const executeCommand = async (command) => {
    return client_1.serverAPI.post("command", {
        command,
    }, {
        headers: {
            Authorization: "Bearer " + config_1.config.PTERO_TOKEN,
            "Content-Type": "application/json",
            Accept: "Application/vnd.pterodactyl.v1+json",
        },
    });
};
exports.executeCommand = executeCommand;
