import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { RxDocument } from 'rxdb';
import { parseISO, startOfDay } from 'date-fns';
import { DbService, RxEventDocumentType } from './db.service';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  public events$: Observable<RxDocument<RxEventDocumentType, {}>[]> = of([]);

  constructor(private dbService: DbService) {
    this.events$ = this.dbService.db.events.find({
      sort: [{ timestamp: 'asc'}]
    }).$;
  }

  getEventsAt$(
    date: Date
  ): Observable<RxDocument<RxEventDocumentType>[] | null> {
    return this.events$.pipe(
      map((events) => {
        const res = events.filter((event) => {
          const eventDate = startOfDay(parseISO(event.date));
          return eventDate.getTime() === date.getTime();
        });
        return res.length === 0 ? null : res;
      })
    );
  }

}
