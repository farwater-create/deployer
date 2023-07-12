import { Client } from "discord.js";
import { safetyCheck } from "./safety-check";
import { helloWorld } from "./hello-world";

export const ready = async (client: Client) => {
  await helloWorld(client);
  await safetyCheck(client);
};
