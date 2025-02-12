import { beforeAll, expect, test, describe, afterAll } from "bun:test";
import request from "supertest";
import type { Express } from "express";
import type { Response } from "superagent";
import { load } from "../loaders";
import { _RX_SERVER } from "../loaders/rxdb";
import type { Agent } from "supertest";
import logger from "../utils/logger";
import { userService } from "../services";

let app: Express;
let authenticatedAgent: Agent;
let sessionCookies: string[];

const createAuthenticatedAgent = async (
  expressApp: Express
): Promise<Agent> => {
  const authAgent = request.agent(expressApp);
  logger.info(`Before cookie jar ${authAgent}`);
  // Go directly to the callback URL since we're using a mock strategy
  const response: Response = await authAgent
    .get("/auth/github/callback")
    .expect(302);

  // Verify the header for debugging
  const cookieHeader = response.headers["set-cookie"];
  sessionCookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader];
  if (!sessionCookies || sessionCookies.length === 0) {
    throw new Error("No session cookie set");
  }
  return authAgent;
};

// Suite level isolation
beforeAll(async () => {
  // Initialize the full application using the loader
  await load();
  app = _RX_SERVER.serverApp;
  authenticatedAgent = await createAuthenticatedAgent(app);
});

afterAll(() => {
  if (_RX_SERVER) {
    _RX_SERVER.close();
  }
  logger.info(
    `After test the size of users is ${userService.getAllUsers().length}`
  );
});

describe("User endpoints", () => {
  describe("POST /user", () => {
    test("should create a new user when authenticated", async () => {
      const mockUser = {
        email: "test@example.com",
        name: "Test User",
        githubId: "test-github-id",
      };

      // Use the pre-authenticated agent which should maintain the session
      const response = await authenticatedAgent
        .post("/user")
        .send(mockUser)
        .expect("Content-Type", /json/)
        .expect(200);

      // Log response headers for debugging
      logger.info(
        `Response headers: ${JSON.stringify(response.request.cookies)}`
      );

      expect(response.body).toMatchObject({
        email: mockUser.email,
        name: mockUser.name,
        githubId: mockUser.githubId,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body._deleted).toBe(false);

      // Verify the user exists in the UserService
      const createdUser = userService.getUser(response.body.id);
      expect(createdUser).toBeDefined();
      expect(createdUser).toMatchObject({
        email: mockUser.email,
        name: mockUser.name,
        githubId: mockUser.githubId,
        id: response.body.id,
        _deleted: false,
      });
    });

    test("should return 401 when not authenticated", async () => {
      const mockUser = {
        email: "test@example.com",
        name: "Test User",
        githubId: "test-github-id",
      };

      await request(app).post("/user").send(mockUser).expect(401);
    });

    // test("should return 400 for invalid user data", async () => {
    //   const invalidUser = {
    //     name: "Test User",
    //     githubId: "test-github-id",
    //     // missing required email field
    //   };

    //   await authenticatedAgent
    //     .post("/user")
    //     .send(invalidUser)
    //     .set("Authorization", "test-auth-token")
    //     .expect(400);
    // });
  });

  describe("GET /user/:userId", () => {
    test("should return user when found and authenticated", async () => {
      // Preload a test user
      const testUser = await userService.createUser({
        email: "get-test@example.com",
        name: "Get Test User",
        githubId: "test-get-github-id",
      });

      const response = await authenticatedAgent
        .get(`/user/${testUser.id}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        githubId: testUser.githubId,
        _deleted: false,
      });
    });

    test("should return 404 when user not found", async () => {
      await authenticatedAgent.get("/user/nonexistent-id").expect(404);
    });
  });
});
