import { beforeAll, afterAll, expect, test, describe } from "bun:test";
import request from "supertest";
import type { Express } from "express";
import { load } from "../loaders";
import { _RX_SERVER, cleanup } from "../loaders/rxdb";
import logger from "../utils/logger";

let app: Express;

beforeAll(async () => {
  // Initialize the full application using the loader
  await load();

  // Get the Express app from the RX server
  app = _RX_SERVER.serverApp;
});

afterAll(async () => {
  await cleanup();
});

describe("Health endpoints", () => {
  test("should return 200 OK with correct message", async () => {
    const response = await request(app)
      .get("/health")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toEqual({ message: "OK" });
  });
});
