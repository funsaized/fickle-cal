import { beforeAll, afterAll, expect, test, describe } from "bun:test";
import request from "supertest";
import type { Express } from "express";
import { load } from "../loaders";
import { _RX_SERVER } from "../loaders/rxdb";
import { userService } from "../services";

let app: Express;

beforeAll(async () => {
  // Initialize the full application using the loader
  await load();

  // Get the Express app from the RX server
  app = _RX_SERVER.serverApp;
});

describe("User endpoints", () => {
  describe("POST /user", () => {
    test("should create a new user when authenticated", async () => {
      const mockUser = {
        email: "test@example.com",
        name: "Test User",
        githubId: "test-github-id",
      };

      const response = await request(app)
        .post("/user")
        .send(mockUser)
        // TODO: Add proper authentication token/session
        .set("Authorization", "test-auth-token")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        email: mockUser.email,
        name: mockUser.name,
        githubId: mockUser.githubId,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body._deleted).toBe(false);
    });

    // test("should return 401 when not authenticated", async () => {
    //   const mockUser = {
    //     email: "test@example.com",
    //     name: "Test User",
    //     githubId: "test-github-id",
    //   };

    //   await request(app).post("/user").send(mockUser).expect(401);
    // });

    // test("should return 400 for invalid user data", async () => {
    //   const invalidUser = {
    //     name: "Test User",
    //     githubId: "test-github-id",
    //     // missing required email field
    //   };

    //   await request(app)
    //     .post("/user")
    //     .send(invalidUser)
    //     .set("Authorization", "test-auth-token")
    //     .expect(400);
    // });
  });

  // describe("GET /user/:userId", () => {
  //   test("should return user when found and authenticated", async () => {
  //     // Create a test user first
  //     const testUser = await userService.createUser({
  //       email: "get-test@example.com",
  //       name: "Get Test User",
  //       githubId: "test-get-github-id",
  //     });

  //     const response = await request(app)
  //       .get(`/user/${testUser.id}`)
  //       .set("Authorization", "test-auth-token")
  //       .expect("Content-Type", /json/)
  //       .expect(200);

  //     expect(response.body).toMatchObject({
  //       id: testUser.id,
  //       email: testUser.email,
  //       name: testUser.name,
  //       githubId: testUser.githubId,
  //       _deleted: false,
  //     });
  //   });

  //   test("should return 404 when user not found", async () => {
  //     await request(app)
  //       .get("/user/nonexistent-id")
  //       .set("Authorization", "test-auth-token")
  //       .expect(404);
  //   });

  //   test("should return 401 when not authenticated", async () => {
  //     await request(app).get("/user/some-id").expect(401);
  //   });
  // });
});
