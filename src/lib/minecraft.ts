import axios, { AxiosResponse } from "axios";
import { config } from "./config";

export const fetchUUID = async (
  name: string
): Promise<{ name: string; id: string }> => {
  const resp = await axios.get(
    `https://api.mojang.com/users/profiles/minecraft/${name}`
  );
  if (resp.status != 200) {
    throw new Error(`${name} not found`);
  }
  return resp.data as { name: string; id: string };
};

export const fetchUsername = async (uuid: string) => {
  const resp = await axios.get(`https://api.mojang.com/user/profile/${uuid}`);
  if (resp.status != 200) {
    throw new Error(`${uuid} not found`);
  }
  return resp.data as { name: string; id: string };
};

const commandEndpoint = `${config.PTERO_SERVER}/api/client/servers/${config.PTERO_SERVER_ID}/command`;

const executeCommand = async (command: string): Promise<AxiosResponse> => {
  const resp = await axios.post(
    commandEndpoint,
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
  return resp;
};

export const whitelistAccount = async (accountName: string) => {
  console.log("whitelisting " + accountName);
  return await executeCommand("whitelist add " + accountName);
};
export const unwhitelistAccount = async (accountName: string) => {
  console.log("unwhitelisting " + accountName);
  return await executeCommand("whitelist remove " + accountName);
};
