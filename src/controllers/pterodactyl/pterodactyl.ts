import { config } from "@config";
import { logger } from "@logger";
import axios, { type AxiosInstance } from "axios";
import { sprintf } from "sprintf-js";
import rateLimit from "axios-rate-limit";


const pteroHeaders = {
  Accept: "Application/vnd.pterodactyl.v1+json",
  Authorization: `Bearer ${config.PTERODACTYL_API_KEY}`,
};

const panelUrl = new URL(`${config.PTERODACTYL_API_URL}/api/client`);


export class PterodactylPanel {
  client: AxiosInstance = axios.create({
    baseURL: panelUrl.toString(),
    headers: pteroHeaders,
  });

  static minecraft(uuid: string): MinecraftPterodactylServer {
    return new MinecraftPterodactylServer(uuid);
  }
}


class PterodactylServer {
  client: AxiosInstance;
  constructor(uuid: string) {
    const _client = axios.create({
      baseURL: new URL(`${panelUrl}/servers/${uuid}`).toString(),
      headers: pteroHeaders,
    });

    this.client = rateLimit(_client, {
      maxRequests: 30,
      perMilliseconds: 60 * 1000
    });

  }

  async execute(command: string, ...args: string[]) {
    const safeCommand = this.safeCommand(command, ...args);
    this.client.post("command", {
      command: safeCommand,
    }).catch((err) => {
      logger.discord("error", `could not run command ${command} on ${this.client.getUri()} due to error: ${err}`)
    });
  }
  /**
   * Takes formatted string (see https://www.npmjs.com/package/sprintf-js)
   * Outputs sanitized command
   * @param command
   * @param args
   * @returns
   */
  safeCommand(command: string, ...args: string[]) {
    args = args.map((arg) => {
      return arg.replace(/^\s+|\s+$|\s+(?=\s)/g, "").replace(/[^\w\s]/gi, "");
    });
    return sprintf(command, args);
  }
}

class MinecraftPterodactylServer extends PterodactylServer {
  async whitelist(user: string) {
    return this.execute(this.safeCommand("whitelist add %s", user));
  }
  async ban(user: string) {
    return this.execute(this.safeCommand("whitelist remove %s", user));
  }
}
