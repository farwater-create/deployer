import { EmbedBuilder, GuildTextBasedChannel, Role, RoleResolvable, TextBasedChannel } from "discord.js";
import pino from "pino";
import { roleToMentionString } from "@lib/discord-helpers/mentions";
import { config } from "@config";
const { ADMIN_ROLE_ID } = config;

type LogLevel = "info" | "error" | "warn" | "debug";

const pinoLogger = pino({
  transport: {
    target: "pino-pretty",
  },
});

interface CustomLogger {
  logChannel?: GuildTextBasedChannel;
  discordLogQueue: any[];
  info: (message: any) => void;
  error: (message: any) => void;
  warn: (message: any) => void;
  debug: (message: any) => void;
  fatal: (message: any) => void;
  discord: (level: LogLevel, message: any) => void;
}

export const logger: CustomLogger = {
  logChannel: undefined,
  discordLogQueue: [],
  info: (message: any) => {
    pinoLogger.info(message);
  },
  error: (message: any) => {
    pinoLogger.error(message);
  },
  warn: (message: any) => {
    pinoLogger.warn(message);
  },
  debug: (message: any) => {
    pinoLogger.debug(message);
  },
  fatal: (message: any) => {
    pinoLogger.fatal(message);
  },
  discord: (level: LogLevel, message: string) => {
    logger[level](message);

    let mention: string = "";
    if(level === "error") {
      mention = roleToMentionString(ADMIN_ROLE_ID)
    }

    if (!logger.logChannel) {
      logger.error("No log channel set, cannot log discord message, logging to console instead.");
      logger.error(message);
      return
    }
    logger.logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`[${level}] ${mention}`)
          .setDescription(`${message}`)
          .setColor(
            level === "error" ? "Red" : level === "warn" ? "Yellow" : "Blue",
          )
          .setTimestamp(new Date(Date.now())),
      ],
    });
  },
};

process.on("uncaughtException", (error) => {
  logger.discord("warn", error);
});
