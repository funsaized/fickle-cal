import {
  type RxCollection,
  type RxJsonSchema,
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
} from "rxdb";

// Domain model interface
export interface User {
  id: string;
  email: string;
  name: string;
  githubId: string;
  _deleted: boolean;
}

// Request DTO
export type UserRequest = Omit<User, "id" | "_deleted">;

// RxDB Schema
export const USER_SCHEMA_LITERAL = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 10,
    },
    email: {
      type: "string",
      maxLength: 255,
    },
    name: {
      type: "string",
    },
    githubId: {
      type: "string",
      maxLength: 300,
    },
    _deleted: {
      type: "boolean",
    },
  },
  required: ["id", "email", "githubId"],
  indexes: ["githubId"],
} as const;

const schemaTyped = toTypedRxJsonSchema(USER_SCHEMA_LITERAL);

export type RxUserDocumentType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const USER_SCHEMA: RxJsonSchema<RxUserDocumentType> =
  USER_SCHEMA_LITERAL;

// RxDB Collection types
export type RxUserMethods = {};

export type RxUsersCollection = RxCollection<
  RxUserDocumentType,
  RxUserMethods,
  {},
  {},
  unknown
>;
