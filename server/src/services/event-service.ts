import { parseISO, startOfDay } from "date-fns";
import type { EventRequest, Event } from "../models";

export class EventService {
  // Map<userId -> Map<UNIX-timestamp, Event[]>>
  private eventsMap = new Map<string, Map<number, Event[]>>();

  constructor() {}

  init(data: EventRequest[]) {
    const toAdd: Event[] = [];
    data.forEach((event) => {
      toAdd.push({
        ...event,
        date: parseISO(event.date),
      });
    });

    toAdd.forEach((event) => {
      let existing = this.eventsMap.get(event.userId);
      if (!existing) {
        this.eventsMap.set(event.userId, new Map());
        existing = this.eventsMap.get(event.userId);
      }
      const events = existing!.get(event.date!.getTime()) || [];
      events.push(event);
      existing!.set(event.date!.getTime(), events);
    });
  }

  createEvent(eventRequest: EventRequest) {
    const event: Event = {
      ...eventRequest,
      date: startOfDay(parseISO(eventRequest.date)),
    };
    const userId = event.userId;
    let userData = this.eventsMap.get(userId);
    if (!userData) {
      this.eventsMap.set(userId, new Map());
      userData = this.eventsMap.get(userId);
    }

    const events = userData!.get(event.date!.getTime()) || [];
    events.push(event);
    userData!.set(event.date!.getTime(), events);

    return event;
  }

  getAllEvents() {
    return [...this.eventsMap.values()] // Get array of timestamp Maps
      .flatMap((timeMap) => [...timeMap.values()]) // Get arrays of events
      .flat(); // Flatten the event arrays
  }

  getUserEvents(userId: string) {
    return this.eventsMap.get(userId);
  }

  dangerouslySetEventsCollection(
    eventsCollection: Map<string, Map<number, Event[]>>
  ) {
    this.eventsMap = eventsCollection;
  }
}

export const eventService = new EventService();
