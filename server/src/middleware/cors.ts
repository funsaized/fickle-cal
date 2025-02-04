import cors from "cors";

export const corsMiddleware = cors({
  origin: process.env.FRONTEND_URL || "http://localhost:4200", // Allow your frontend origin
  credentials: true, // Required for cookies, authorization headers with HTTPS
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
})