import {
  type RxCollection,
  type RxDatabase,
  type RxJsonSchema,
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
} from "rxdb";

// Domain model interface
export interface Event {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  notes: string;
  color: string;
  timestamp: number;
  index: number;
  userId: string;
  _deleted: boolean;
}

// Request DTO
export interface EventRequest extends Omit<Event, "date"> {
  date: string;
}

// RxDB Schema
export const EVENT_SCHEMA_LITERAL = {
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

// RxDB Collection types
export type RxEventMethods = {};

export type RxEventsCollection = RxCollection<
  RxEventDocumentType,
  RxEventMethods,
  {},
  {},
  unknown
>;
