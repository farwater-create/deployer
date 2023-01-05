"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PteroFS = void 0;
const client_1 = require("./client");
const zod_1 = __importDefault(require("zod"));
const axios_1 = __importDefault(require("axios"));
const serverAPIFileDownloadResponseSchema = zod_1.default.object({
    object: zod_1.default.string(),
    attributes: zod_1.default.object({
        url: zod_1.default.string(),
    }),
});
const fileLocks = new Set();
exports.PteroFS = {
    async readFile(path) {
        const parameters = new URLSearchParams();
        parameters.append("file", path);
        const resp = await client_1.serverAPI.get("/files/download?" + parameters.toString());
        const respData = serverAPIFileDownloadResponseSchema.parse(resp.data);
        const url = respData.attributes.url;
        const fileResp = await axios_1.default.get(url, { responseType: "blob" });
        return Buffer.from(fileResp.data);
    },
    async writeFile(path, data) {
        const parameters = new URLSearchParams();
        parameters.append("file", path);
        await new Promise((resolve) => {
            const interval = setInterval(() => {
                if (!fileLocks.has(path)) {
                    clearInterval(interval);
                    resolve();
                }
                else {
                    fileLocks.add(path);
                    clearInterval(interval);
                    resolve();
                }
            }, 1000);
        });
        try {
            await client_1.serverAPI.post("/files/write?" + parameters.toString(), data);
        }
        catch (error) {
            return error;
        }
        finally {
            fileLocks.delete(path);
        }
        return;
    },
};
