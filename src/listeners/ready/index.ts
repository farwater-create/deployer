import { Client } from "discord.js";
import { safetyCheck } from "@controllers/tasks/safety-check";

export const ready = async (client: Client) => {
  await safetyCheck(client);
};
