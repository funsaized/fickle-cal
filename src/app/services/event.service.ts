import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap, takeWhile } from 'rxjs';
import { Day, EventDetail, ParsedDay } from '../models';

@Injectable({
  providedIn: 'root',
})
export class EventService {

  private _events$ = new BehaviorSubject<EventDetail[]>([]);

  // TODO: http events 
  init(days: Day[]): void {
    const defaultEvents: EventDetail[] = [
      {
        id: null,
        title: 'A demo event',
        date: days[0].date,
        completed: false,
        notes: null,
        color: null,
      },
      {
        id: null,
        title: 'Hover me to mark as complete',
        date: days[0].date,
        completed: false,
        notes: null,
        color: null,
      },
      {
        id: null,
        title: 'This one has a color',
        date: days[1].date,
        completed: false,
        notes: null,
        color: 'Orange',
      },
    ];

    this._events$.next(defaultEvents);
  }

  get events$() {
    return this._events$.asObservable();
  }

  getEventsAt$(date: Date): Observable<EventDetail[]> {
    return this._events$.pipe(
      switchMap((events) => of(events.filter((event) => event.date === date)))
    );
  }
}
