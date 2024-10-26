import { Injectable } from '@angular/core';
import { RxCollection, RxDatabase } from 'rxdb';
import { databasePromise, EventDocType } from '../models';
import { from, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private _db!: RxDatabase<{ events: RxCollection<EventDocType, {}> }>;

  constructor() {
  }

  public init$() {
    return from(databasePromise).pipe(
      tap((db) => this._db = db),
      tap(() => console.warn('DB Service initialized'))
    )
  }

  get db() {
    return this._db;
  }

  getAllEvents$() {
    return from(this.db.events.find().exec());
  }
}
