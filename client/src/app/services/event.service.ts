import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { WeekService } from './week.service';
import { EventDetail, ParsedDay } from '../models';

@Injectable({
  providedIn: 'root',
})
export class EventService {

  constructor(private readonly weekService: WeekService) {
    this.weekService.currentDays$.pipe(
      switchMap((days) => this.init(days))
    ).subscribe((events) => {
      console.error("Init events ", events)
      this._events$.next(events);
    });
  }

  private _events$ = new BehaviorSubject<EventDetail[]>([]);


  // TODO: http events 
  init(days: ParsedDay[]): Observable<EventDetail[]> {
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

    return of(defaultEvents);
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
