import type { Express } from "express";
import healthRoutes from "../routes/health";

export default async function (app: Express) {
  app.use("/health", healthRoutes);
}
