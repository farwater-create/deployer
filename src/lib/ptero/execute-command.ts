import { AxiosResponse } from "axios";
import { config } from "../config";
import { serverAPI } from "./client";
const commandQueue: Array<() => void> = [];
const commandSet: Set<string> = new Set();
let commandQueueInterval: NodeJS.Timer | undefined;

const CommandExistsError = new Error("command already exists");

export const executeCommand = async (
  command: string
): Promise<AxiosResponse | Error> => {
  if (commandSet.has(command)) {
    return CommandExistsError;
  }
  console.log("added command: " + command + " to the queue");
  if (!commandQueueInterval) {
    setInterval(() => {
      const handler = commandQueue.pop();
      if (handler) {
        commandSet.delete(command);
        handler();
        console.log("ran command: " + command);
      } else {
        clearInterval(commandQueueInterval);
        commandQueueInterval = undefined;
      }
    }, 1000);
  }

  return new Promise((resolve, reject) => {
    commandQueue.push(() => {
      serverAPI
        .post(
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
        )
        .then((response) => resolve(response))
        .catch((error) => reject(error));
    });
  });
};
