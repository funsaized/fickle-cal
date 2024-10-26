import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, switchMap, tap } from 'rxjs';
import { EventDocType } from '../models';
import { RxDocument } from 'rxdb';
import { parseISO, startOfDay } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private _events$ = new BehaviorSubject<RxDocument<EventDocType>[]>([]);

  get events$(): Observable<RxDocument<EventDocType>[]> {
    return this._events$.asObservable();
  }

  set events$(events: RxDocument<EventDocType>[]) {
    this._events$.next(events);
  }

  getEventsAt$(date: Date): Observable<RxDocument<EventDocType>[]> {
    return this.events$.pipe(
      map((events) =>
        events.filter((event) => {
          const eventDate = startOfDay(parseISO(event.date));
          return eventDate.getTime() === date.getTime();
        })
      )
    )
  }
}
