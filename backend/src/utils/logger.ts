import winston from "winston";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();
const { NODE_ENV } = process.env;

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`;
  })
);

const logger = winston.createLogger({
  level: NODE_ENV === "production" ? "info" : "debug",
  defaultMeta: { service: "bulk-email-service" },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "info.log"),
      level: "info",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "http.log"),
      level: "http",
      format: fileFormat,
    }),
    ...(NODE_ENV !== "production"
      ? [
          new winston.transports.Console({
            format: consoleFormat,
            handleExceptions: true,
          }),
        ]
      : []),
  ],
  exitOnError: false,
});

export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;
