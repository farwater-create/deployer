import {EmbedBuilder, GuildTextBasedChannel} from "discord.js";
import pino from "pino";

export type LogLevel = "info" | "error" | "warn" | "debug";

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

        if (!logger.logChannel) {
            logger.error("No log channel set, cannot log discord message, logging to console instead.");
            logger.error(message);
            return;
        }
        logger.logChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`[${level}]`)
                    .setDescription(`${message}`)
                    .setColor(level === "error" ? "Red" : level === "warn" ? "Yellow" : "Blue")
                    .setTimestamp(new Date(Date.now())),
            ],
        });
    },
};

process.on("uncaughtException", (error) => {
    logger.discord("warn", error);
});
