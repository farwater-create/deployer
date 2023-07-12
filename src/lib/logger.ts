import { EmbedBuilder, TextBasedChannel } from "discord.js";
import pino from "pino";

type LogLevel = "info" | "error" | "warn" | "debug";

const pinoLogger = pino({
  transport: {
    target: "pino-pretty",
  },
});

interface CustomLogger {
  logChannel?: TextBasedChannel;
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
    logger.discord("info", message);
  },
  error: (message: any) => {
    pinoLogger.error(message);
    logger.discord("error", message);
  },
  warn: (message: any) => {
    pinoLogger.warn(message);
    logger.discord("warn", message);
  },
  debug: (message: any) => {
    pinoLogger.debug(message);
    logger.discord("debug", message);
  },
  fatal: (message: any) => {
    pinoLogger.fatal(message);
    logger.discord("error", message);
  },
  discord: (level: LogLevel, message: any) => {
    if (!logger.logChannel) {
      logger.discordLogQueue.push(message);
      return;
    }

    if (logger.discordLogQueue.length > 0) {
      logger.discord(level, logger.discordLogQueue.shift());
    }

    logger.logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`[${level}]`)
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
  logger.fatal(error);
});
