import { Injectable } from '@angular/core';
import { RxCollection, RxDatabase, RxDocument } from 'rxdb';
import { databasePromise, EventDocType } from '../models';
import { from, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private _db!: RxDatabase<{ events: RxCollection<EventDocType, {}> }>;
  public events$!: Observable<RxDocument<EventDocType, {}>[]>;

  constructor() {
  }

  public init$() {
    return from(databasePromise).pipe(
      tap((db) => (this._db = db)),
      tap(() => console.warn('DB Service initialized')),
      tap((_) =>     this.events$ = this._db.events.find().$),
      map((_) => true)
    );
  }

  get db() {
    return this._db;
  }
}
