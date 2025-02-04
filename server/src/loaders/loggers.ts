import type { Express, Request } from "express";
import logger from "../utils/logger";
import morgan from "morgan";
import { correlator, getCorrelationId } from "../middleware/correlator";

// Custom tokens
morgan.token("session-id", (req: Request) => req.sessionID || "-");
morgan.token("user-id", (req: Request) =>
  req.user ? (req.user as any).id : "-"
);

const morganFormat =
  ":method :url :status :res[content-length] :session-id :user-id :user-agent :response-time";

export default async function (app: Express) {
  // Add correlationId generator middleware
  app.use(correlator);

  // Add morgan middleware
  app.use(
    morgan(morganFormat, {
      stream: {
        write: (message) => {
          const logObject = {
            method: message.split(" ")[0],
            url: message.split(" ")[1],
            status: message.split(" ")[2],
            contentLength: message.split(" ")[3],
            sessionId: message.split(" ")[4],
            userId: message.split(" ")[5],
            userAgent: message.split(" ")[6],
            responseTime: message.split(" ")[7],
          };
          logger.info(JSON.stringify(logObject));
        },
      },
    })
  );
}
