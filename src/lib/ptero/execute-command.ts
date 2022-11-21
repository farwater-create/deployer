import { AxiosResponse } from "axios";
import { config } from "../config";
import { serverAPI } from "./client";
export const executeCommand = async (
  command: string
): Promise<AxiosResponse | Error> => {
  return serverAPI.post(
    "command",
    {
      command,
    },
    {
      headers: {
        Authorization: "Bearer " + config.PTERO_TOKEN,
        "Content-Type": "application/json",
        Accept: "Application/vnd.pterodactyl.v1+json",
      },
    }
  );
};
