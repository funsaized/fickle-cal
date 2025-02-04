import { DB } from "./rxdb";
import type { RxEventDocumentType } from "../rxdb-server/schema";
import type { User } from "../models";
import { parseISO } from "date-fns";
import type { Event } from "../models";
import logger from "../utils/logger";
import { userService, eventService } from "../services";

export default async function () {
  if (!DB) {
    throw new Error("DB required for datastore-rxdb loader");
  }

  const userCollection = DB.users;
  const eventsCollection = DB.events;
  if (!userCollection || !eventsCollection) {
    throw new Error(
      "user or events collection required for datastore-rxdb loader"
    );
  }

  logger.info("Attempting to insert users...");
  const result1 = await userCollection.bulkInsert(userService.getAllUsers());

  logger.info("Attempting to insert events...");
  const allEvents = eventService.getAllEvents();
  const allEventDocs = allEvents.map((event) => ({
    ...event,
    date: event.date.toISOString(),
  })) as RxEventDocumentType[];
  const result2 = await eventsCollection.bulkInsert(allEventDocs);

  // FIXME: params
  const interval = 1000 * 60 * 60 * 12;
  // const interval = 10000;
  setInterval(() => {
    syncUsers();
  }, interval);
  setInterval(() => {
    syncEvents();
  }, interval);
}

const syncUsers = async () => {
  const usersCollection = DB!.users;
  const allUsers = await usersCollection.find().exec();
  logger.info(`Syncing users count ${allUsers.length}...`);
  const datastore = new Map<string, User>();
  allUsers.forEach((user) => {
    const toAdd: User = {
      id: user.id,
      email: user.email,
      name: user.name || "",
      githubId: user.githubId,
      _deleted: user._deleted || false,
    };
    datastore.set(user.id, toAdd);
  });
  userService.dangerouslySetUsersCollection(datastore);
  logger.info("Synced users");
};

const syncEvents = async () => {
  const eventsCollection = DB!.events;
  const allEvents = await eventsCollection.find().exec();
  logger.info(`Syncing events count ${allEvents.length}...`);
  const datastore = new Map<string, Map<number, Event[]>>();
  allEvents.forEach((event) => {
    const userId = event.userId!;
    let userData = datastore.get(userId);
    if (!userData) {
      datastore.set(userId, new Map());
      userData = datastore.get(userId);
    }
    const mapped: Event = {
      id: event.id,
      title: event.title,
      date: parseISO(event.date!),
      completed: event.completed || false,
      notes: event.notes || "",
      color: event.color || "",
      timestamp: event.timestamp || 0,
      index: event.index || 0,
      userId: event.userId!,
      _deleted: event._deleted || false,
    };
    const events = userData?.get(mapped.date!.getTime());
    if (events) {
      events.push(mapped);
      userData!.set(mapped.date!.getTime(), events);
    } else {
      userData?.set(mapped.date!.getTime(), [mapped]);
    }
  });
  eventService.dangerouslySetEventsCollection(datastore);
  logger.info("Synced events");
};
