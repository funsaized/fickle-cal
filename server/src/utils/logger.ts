import { createLogger, format, transports } from "winston";
import { getCorrelationId } from "../middleware/correlator";
const { combine, timestamp, json, colorize, errors } = format;

// Pretty console logging
const consoleLogFormat = format.combine(
  errors({ stack: true }),
  colorize(),
  format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${getCorrelationId()} - ${message} ${
      stack ? `\n${stack}` : ""
    }`;
  })
);

// Winston logger
const logger = createLogger({
  level: "info",
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }),
    // new transports.File({ filename: "app.log" }),
  ],
});

export default logger;
