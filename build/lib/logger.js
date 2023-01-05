"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable unicorn/prevent-abbreviations */
const node_fs_1 = __importDefault(require("node:fs"));
try {
    node_fs_1.default.mkdirSync("./logs");
    // eslint-disable-next-line no-empty
}
catch { }
const red = "\u001B[41m";
const reset = "\u001B[0m";
const logFile = node_fs_1.default.createWriteStream(`./logs/${new Date(Date.now()).toISOString()}`);
const prettyPrint = (object) => {
    switch (typeof object) {
        case "object": {
            try {
                return JSON.stringify(object, undefined, 2);
            }
            catch {
                return `${object}`;
            }
        }
        default: {
            return `${object}`;
        }
    }
};
const log = (color) => {
    return (...args) => {
        const contents = args.map((value) => prettyPrint(value)).join(" ") + "\n";
        const date = `[${new Date(Date.now()).toISOString()}]`;
        process.stdout.write(`${color}${date}${reset} ${contents}`);
        logFile.write(`${date} ${contents}`);
    };
};
exports.default = {
    error: log(red),
    log: log(reset),
    info: log(reset),
};
process.on("beforeExit", () => logFile.close());
