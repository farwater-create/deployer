import { Interaction } from "discord.js";

enum  ApplicationCallback {
  // The callback id for the application submission message
  Start = "application:start",
  Submit = "application:submit",
  Accept = "application:accept",
  Reject = "application:reject",
}

interface InteractionCallback {
  id: string;
  callback: (interaction: Interaction) => void;
}
