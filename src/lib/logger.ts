/* eslint-disable unicorn/prevent-abbreviations */
import fs from "node:fs";
try {
  fs.mkdirSync("./logs");
  // eslint-disable-next-line no-empty
} catch {}

const red = "\u001B[41m";

const reset = "\u001B[0m";

const logFile = fs.createWriteStream(
  `./logs/${new Date(Date.now()).toISOString()}`
);

const prettyPrint = (object: unknown) => {
  switch (typeof object) {
    case "object": {
      try {
        return JSON.stringify(object, undefined, 2);
      } catch {
        return `${object}`;
      }
    }
    default: {
      return `${object}`;
    }
  }
};

const log = (color: string) => {
  return (...args: unknown[]) => {
    const contents = args.map((value) => prettyPrint(value)).join(" ") + "\n";
    const date = `[${new Date(Date.now()).toISOString()}]`;
    process.stdout.write(`${color}${date}${reset} ${contents}`);
    logFile.write(`${date} ${contents}`);
  };
};

export default {
  error: log(red),
  log: log(reset),
  info: log(reset),
};

process.on("beforeExit", () => logFile.close());
