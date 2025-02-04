import {
  type RxCollection,
  type RxDatabase,
  type RxJsonSchema,
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
} from "rxdb";

const EVENT_SCHEMA_LITERAL = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    title: {
      type: "string",
    },
    date: {
      type: "string",
      format: "date-time",
      maxLength: 30,
    },
    completed: {
      type: "boolean",
    },
    notes: {
      type: "string",
    },
    color: {
      type: "string",
    },
    timestamp: {
      type: "number",
    },
    index: {
      type: "number",
    },
    userId: {
      type: "string",
      maxLength: 10,
    },
    _deleted: {
      type: "boolean",
    },
  },
  required: ["id", "title", "date"],
  indexes: ["date", ["userId", "date"]],
} as const;

const schemaTyped = toTypedRxJsonSchema(EVENT_SCHEMA_LITERAL);

export type RxEventDocumentType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const EVENTS_SCHEMA: RxJsonSchema<RxEventDocumentType> =
  EVENT_SCHEMA_LITERAL;

type RxEventMethods = {};

export type RxEventsCollection = RxCollection<
  RxEventDocumentType,
  RxEventMethods,
  {},
  {},
  unknown
>;

export type RxEventsDatabase = RxDatabase<
  RxEventsCollections,
  any,
  any,
  unknown
>;

// User schema
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
      maxLength: 300, // total guess
    },
    _deleted: {
      type: "boolean",
    },
  },
  required: ["id", "email", "githubId"],
  indexes: ["githubId"],
} as const;

// Add type definitions
export type RxUserDocumentType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof USER_SCHEMA_LITERAL
>;

export type RxUsersCollection = RxCollection<
  RxUserDocumentType,
  {},
  {},
  {},
  unknown
>;

// Update database collections type
export type RxEventsCollections = {
  events: RxEventsCollection;
  users: RxUsersCollection;
};
