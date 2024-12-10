import { Injectable } from '@angular/core';
import { filter, map, Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { RxDocument } from 'rxdb';
import { formatISO, parseISO, startOfDay } from 'date-fns';
import { DbService, RxEventDocumentType } from './db.service';
import { CalendarKeys } from '../models';

@Injectable({
  providedIn: 'root',
})
export class EventService {

  private _eventsMap = new Map<CalendarKeys, BehaviorSubject<RxDocument<RxEventDocumentType>[]>>();

  constructor(private dbService: DbService) {
  }

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

  private getOrCreateDaySubject(key: CalendarKeys): BehaviorSubject<RxDocument<RxEventDocumentType>[]> {
    if (!this._eventsMap.has(key)) {
      this._eventsMap.set(key, new BehaviorSubject<RxDocument<RxEventDocumentType>[]>([]));
    }
    return this._eventsMap.get(key)!;
  }

  setEventsMap(key: CalendarKeys, events: RxDocument<RxEventDocumentType>[]) {
    this.getOrCreateDaySubject(key).next(events);
  }

  getEventsStream$(key: CalendarKeys): Observable<RxDocument<RxEventDocumentType>[]> {
    return this.getOrCreateDaySubject(key as CalendarKeys).asObservable();
  }
}
