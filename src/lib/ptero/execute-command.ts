import { AxiosResponse } from "axios";
import { config } from "../config";
import { serverAPI } from "./client";
const commandQueue: Array<() => void> = [];
let commandQueueInterval: NodeJS.Timer | undefined;
const COMMAND_COOLDOWN = 10 * 1000;
export const executeCommand = async (
  command: string
): Promise<AxiosResponse | Error> => {
  console.log("added command: " + command + " to the queue");
  if (!commandQueueInterval) {
    const handleCommand = () => {
      const handler = commandQueue.pop();
      if (handler) {
        handler();
        console.log("ran command: " + command);
      } else {
        clearInterval(commandQueueInterval);
        commandQueueInterval = undefined;
      }
    };
    handleCommand();
    setInterval(() => handleCommand, COMMAND_COOLDOWN);
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
