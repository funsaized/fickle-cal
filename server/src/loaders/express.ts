import type { Express } from "express";
import { corsMiddleware } from "../middleware";
import authRoutes from "../routes/auth";
import eventsRoutes from "../routes/events";
import userRoutes from "../routes/users";

export default async function (app: Express) {
  // Server sits behind a proxy
  app.set("trust proxy", 1);

  // Add the CORS middleware
  app.use(corsMiddleware);

  // Routes
  // Use configured auth handler routes
  app.use("/auth", authRoutes);

  // Use events routes
  app.use("/events", eventsRoutes);

  // Use user routes
  app.use("/user", userRoutes);
}
