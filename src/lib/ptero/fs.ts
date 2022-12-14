import { serverAPI } from "./client";
import z from "zod";
import axios from "axios";
const serverAPIFileDownloadResponseSchema = z.object({
  object: z.string(),
  attributes: z.object({
    url: z.string(),
  }),
});

const fileLocks: Set<string> = new Set();

export const PteroFS = {
  async readFile(path: string): Promise<Buffer> {
    const parameters = new URLSearchParams();
    parameters.append("file", path);
    const resp = await serverAPI.get(
      "/files/download?" + parameters.toString()
    );
    const respData = serverAPIFileDownloadResponseSchema.parse(resp.data);
    const url = respData.attributes.url;
    const fileResp = await axios.get(url, { responseType: "blob" });
    return Buffer.from(fileResp.data);
  },

  async writeFile(path: string, data: Buffer): Promise<unknown> {
    const parameters = new URLSearchParams();
    parameters.append("file", path);

    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (!fileLocks.has(path)) {
          clearInterval(interval);
          resolve();
        } else {
          fileLocks.add(path);
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });

    try {
      await serverAPI.post("/files/write?" + parameters.toString(), data);
    } catch (error) {
      return error;
    } finally {
      fileLocks.delete(path);
    }
    return;
  },
};
