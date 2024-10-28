import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, switchMap, tap } from 'rxjs';
import { RxDocument } from 'rxdb';
import { parseISO, startOfDay } from 'date-fns';
import { DbService, RxEventDocumentType } from './db.service';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  public events$: Observable<RxDocument<RxEventDocumentType, {}>[]> = of([]);

  constructor(private dbService: DbService) {
    this.events$ = this.dbService.db.events.find().$;
  }

  getEventsAt$(date: Date): Observable<RxDocument<RxEventDocumentType>[]> {
    return this.events$.pipe(
      map((events) =>
        events.filter((event) => {
          const eventDate = startOfDay(parseISO(event.date));
          return eventDate.getTime() === date.getTime();
        })
      )
    );
  }
}
