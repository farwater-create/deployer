import axios from "axios";
import logger from "./logger";
import { executeCommand } from "./ptero/execute-command";
import { PteroFS } from "./ptero/fs";

interface MinecraftWhitelistEntry {
  uuid: string;
  name: string;
}

type MinecraftWhitelist = Array<MinecraftWhitelistEntry>;

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

export const whitelistAccount = async (account: {
  name: string;
  uuid: string;
}) => {
  logger.info("whitelisting " + account.name);
  try {
    await executeCommand("whitelist add " + account.name);
  } catch {
    const whitelistBuffer = await PteroFS.readFile("whitelist.json");
    const whitelistJSON = whitelistBuffer.toString("utf8");
    const whitelist = JSON.parse(whitelistJSON) as MinecraftWhitelist;
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
    PteroFS.writeFile("whitelist.json", buffer);
  }
};

export const unwhitelistAccount = async (account: {
  name: string;
  uuid: string;
}) => {
  try {
    await executeCommand("whitelist remove " + account.name);
  } catch {
    const whitelistBuffer = await PteroFS.readFile("whitelist.json");
    const whitelistJSON = whitelistBuffer.toString("utf8");
    let whitelist = JSON.parse(whitelistJSON) as MinecraftWhitelist;
    whitelist = whitelist.filter(
      (item) => item.uuid != account.uuid && item.name != account.name
    );
    const buffer = Buffer.from(JSON.stringify(whitelist, undefined, 2), "utf8");
    PteroFS.writeFile("whitelist.json", buffer);
  }
};
