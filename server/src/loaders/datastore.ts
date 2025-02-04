import { join } from "path";
import type { EventRequest, User } from "../models";
import logger from "../utils/logger";
import { userService, eventService } from "../services";

export default async function () {
  await loadUsers();
  await loadEvents();
  // FIXME: params
  const interval = 1000 * 60 * 60 * 24;
  // const interval = 10000;
  setInterval(() => {
    backupUsers();
  }, interval);
  setInterval(() => {
    backupEvents();
  }, interval);
}

// FIXME: do this more efficiently
const backupUsers = async () => {
  const users = userService.getAllUsers();
  const jsonlContent = users.map((user) => JSON.stringify(user)).join("\n");
  await Bun.write(join(import.meta.dir, "../data/users.jsonl"), jsonlContent);
  logger.info("____ background job: Users backed up ____");
};

const backupEvents = async () => {
  const events = eventService.getAllEvents();
  const jsonlContent = events.map((event) => JSON.stringify(event)).join("\n");
  await Bun.write(join(import.meta.dir, "../data/events.jsonl"), jsonlContent);
  logger.info("____ background job: Events backed up ____");
};

const loadUsers = async () => {
  logger.info("***** BEGINNING STREAMING USERS FROM FILE *****");
  const users = await loadJsonlUsers();
  logger.info(
    `***** ENDING STREAMING USERS FROM FILE. Loaded ${users?.length} users *****`
  );
};

const loadJsonlUsers = async () => {
  const stored = Bun.file(join(import.meta.dir, "../data/users.jsonl"));
  const stream = stored.stream().pipeThrough(new TextDecoderStream());
  const reader = stream.getReader();
  const users: User[] = [];
  // holds current line, and last element in string
  let stringBuffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      stringBuffer += value;
      const linesInString = stringBuffer.split("\n");

      for (let i = 0; i < linesInString.length - 1; i++) {
        const line = linesInString[i]?.trim();
        if (line) {
          const user = JSON.parse(line) as User;
          users.push(user);
        }
      }

      // Keep last potentially incomplete line
      stringBuffer = linesInString[linesInString.length - 1];
    }
  } finally {
    reader.releaseLock();
  }

  return users;
};

const loadJsonlEvents = async () => {
  const stored = Bun.file(join(import.meta.dir, "../data/events.jsonl"));
  const stream = stored.stream().pipeThrough(new TextDecoderStream());
  const reader = stream.getReader();
  const events: EventRequest[] = [];
  let stringBuffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      stringBuffer += value;
      const linesInString = stringBuffer.split("\n");

      for (let i = 0; i < linesInString.length - 1; i++) {
        const line = linesInString[i];
        if (line) {
          const event = JSON.parse(line) as EventRequest;
          events.push(event);
        }
      }

      // Keep the last potentially incomplete line
      stringBuffer += linesInString[linesInString.length - 1];
    }
  } finally {
    reader.releaseLock();
  }

  return events;
};

const loadEvents = async () => {
  logger.info("***** BEGINNING STREAMING EVENTS FROM FILE *****");
  const events = await loadJsonlEvents();
  logger.info(
    `***** ENDING STREAMING EVENTS FROM FILE. Loaded ${events?.length} users *****`
  );
};
