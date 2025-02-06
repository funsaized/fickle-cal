process.env.NODE_ENV = "test";
process.env.GITHUB_CLIENT_ID = "testClientId";
process.env.GITHUB_CLIENT_SECRET = "testClientSecret";
process.env.GITHUB_CALLBACK_URL = "http://localhost:8080/auth/github/callback";
process.env.SESSION_SECRET = "test-secret-key";
process.env.FRONTEND_URL = "http://localhost:4200";

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts"],
};
