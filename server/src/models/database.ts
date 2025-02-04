import { type RxDatabase } from "rxdb";
import { type RxEventsCollection } from "./event";
import { type RxUsersCollection } from "./user";

// Database collections type
export interface RxEventsCollections {
  events: RxEventsCollection;
  users: RxUsersCollection;
}

// Full database type
export type RxEventsDatabase = RxDatabase<
  RxEventsCollections,
  any,
  any,
  unknown
>;
