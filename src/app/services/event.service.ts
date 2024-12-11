import { Injectable } from '@angular/core';
import { filter, map, Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { RxDocument } from 'rxdb';
import { formatISO, parseISO, startOfDay } from 'date-fns';
import { DbService, RxEventDocumentType } from './db.service';
import { CalendarKeys, ReOrderEvent } from '../models';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private _eventsMap = new Map<
    CalendarKeys,
    BehaviorSubject<RxDocument<RxEventDocumentType>[]>
  >();

  constructor(private dbService: DbService) {}

  getDayStream$(
    date: Date
  ): Observable<RxDocument<RxEventDocumentType>[] | null> {
    return this.dbService.db.events.find({
      selector: {
        date: {
          $eq: formatISO(startOfDay(date)),
        },
      },
      sort: [{ index: 'asc' }],
    }).$;
  }

  async reorder(event: ReOrderEvent) {
    if (event.prev.container !== event.curr.container) {
      // If no list, then add event and update index
      if (!event.curr.list) {
        await event.dragged?.incrementalPatch({ index: event.curr.index });
      } else {
        // Remove from previous, put in new, immediately update UI
        const previousList = [...event.prev.list];
        previousList.splice(event.prev.index, 1);

        // Eagerly update the models driving UI
        const prevDateKey = formatISO(startOfDay(event.prev.context.date));
        this.setEventsMap(prevDateKey, previousList);

        const currDateKey = formatISO(startOfDay(event.curr.context.date));
        const currentList = [...event.curr.list];
        currentList.splice(event.curr.index, 0, event.dragged);
        this.setEventsMap(currDateKey, currentList);

        await event.dragged?.incrementalPatch({
          date: formatISO(startOfDay(event.curr.context.date)),
        });

        // Update indices
        const prevUpdates = previousList.map((doc, index) =>
          doc.incrementalPatch({ index })
        );
        const currUpdates = currentList.map((doc, index) =>
          doc.incrementalPatch({ index })
        );
        await Promise.all([...prevUpdates, ...currUpdates]);
      }
    } else {
      const list = [...event.curr.list];
      const [removed] = list.splice(event.prev.index, 1);
      list.splice(event.curr.index, 0, removed);

      // Eagerly update the models driving UI
      const currDateKey = formatISO(startOfDay(event.curr.context.date));

      this.setEventsMap(currDateKey, list);

      // Update indices
      await Promise.all(
        list.map((doc, index) => doc.incrementalPatch({ index }))
      );
    }
  }

  private getOrCreateDaySubject(
    key: CalendarKeys
  ): BehaviorSubject<RxDocument<RxEventDocumentType>[]> {
    if (!this._eventsMap.has(key)) {
      this._eventsMap.set(
        key,
        new BehaviorSubject<RxDocument<RxEventDocumentType>[]>([])
      );
    }
    return this._eventsMap.get(key)!;
  }

  setEventsMap(key: CalendarKeys, events: RxDocument<RxEventDocumentType>[]) {
    this.getOrCreateDaySubject(key).next(events);
  }

  getEventsStream$(
    key: CalendarKeys
  ): Observable<RxDocument<RxEventDocumentType>[]> {
    return this.getOrCreateDaySubject(key as CalendarKeys).asObservable();
  }
}
