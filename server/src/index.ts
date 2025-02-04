import logger from "./utils/logger";

async function startServer() {
  logger.info("Validating environment...");

  logger.info("Initializing server...");
  (await import("./loaders")).default();
}

startServer();
