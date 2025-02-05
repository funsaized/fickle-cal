import request from "supertest";
import express from "express";

describe("Health Endpoint", () => {
  let app: express.Express;

  beforeEach(async () => {
    app = await (await import("../loaders")).default();
  });

  it("should return 200 OK with correct message", async () => {
    const response = await request(app)
      .get("/health")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toEqual({ message: "OK" });
  });
});
