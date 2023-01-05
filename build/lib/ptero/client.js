"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.panelAPI = exports.serverAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const pteroHeaders = {
    Accept: "Application/vnd.pterodactyl.v1+json",
    Authorization: `Bearer ${config_1.config.PTERO_TOKEN}`,
};
const panelAPIBaseURL = `${config_1.config.PTERO_SERVER}/api/client`;
const serverAPIBaseURL = `${panelAPIBaseURL}/servers/${config_1.config.PTERO_SERVER_ID}`;
exports.serverAPI = axios_1.default.create({
    baseURL: serverAPIBaseURL,
    timeout: 5000,
    headers: pteroHeaders,
});
exports.panelAPI = axios_1.default.create({
    baseURL: panelAPIBaseURL,
    timeout: 5000,
    headers: pteroHeaders,
});
