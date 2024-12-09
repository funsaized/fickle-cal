import { Injectable } from '@angular/core';
import { filter, map, Observable, of, Subject } from 'rxjs';
import { RxDocument } from 'rxdb';
import { formatISO, parseISO, startOfDay } from 'date-fns';
import { DbService, RxEventDocumentType } from './db.service';
import { CalendarKeys } from '../models';

@Injectable({
  providedIn: 'root',
})
export class EventService {

  private _dayRefresh$ = new Subject<Date>();
  private _prevDayRefresh$ = new Subject<Date>();
  private eventsMap = new Map<CalendarKeys, RxDocument<RxEventDocumentType>[]>();

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

  get dayRefresh$(): Observable<Date> {
    return this._dayRefresh$.asObservable();
  }

  set dayRefresh$(date: Date) {
    this._dayRefresh$.next(date);
  }

  get prevDayRefresh$(): Observable<Date> {
    return this._prevDayRefresh$.asObservable();
  }

  set prevDayRefresh$(date: Date) {
    this._prevDayRefresh$.next(date);
  }

  setEventsMap(key: CalendarKeys, events: RxDocument<RxEventDocumentType>[]) {
    this.eventsMap.set(key, events);
  }

  getEventsMap(key: CalendarKeys | string) {
    return this.eventsMap.get(key as CalendarKeys) || [];
  }
}
