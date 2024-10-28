import { Injectable, Injector, isDevMode, Signal } from '@angular/core';
import {
  addRxPlugin,
  createRxDatabase,
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxCollection,
  RxCollectionCreator,
  RxDatabase,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { initWeek } from '../models';
import { formatISO, startOfDay } from 'date-fns';

const EVENT_SCHEMA_LITERAL = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    title: {
      type: 'string',
    },
    date: {
      type: 'string',
      format: 'date-time',
      maxLength: 30,
    },
    completed: {
      type: 'boolean',
    },
    notes: {
      type: 'string',
    },
    color: {
      type: 'string',
    },
  },
  required: ['id', 'title'],
  indexes: ['date'],
};

const schemaTyped = toTypedRxJsonSchema(EVENT_SCHEMA_LITERAL);

export type RxEventDocumentType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const EVENTS_SCHEMA: RxJsonSchema<RxEventDocumentType> = EVENT_SCHEMA_LITERAL;

const collectionSettings = {
  ['events']: {
    schema: EVENTS_SCHEMA,
  } as RxCollectionCreator<any>,
};

export type EventDocType = {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  notes: string;
  color: string;
};
let DB_INSTANCE: RxEventsDatabase;

type RxEventMethods = {

}

export type RxEventsCollection = RxCollection<
  RxEventDocumentType,
  RxEventMethods,
  unknown,
  unknown,
  unknown
>;


export type RxEventsCollections = {
  events: RxEventsCollection;
}

export type RxEventsDatabase = RxDatabase<
  RxEventsCollections,
  any,
  any,
  unknown
>;

export async function _createDb(): Promise<RxEventsDatabase> {
  // import dev-mode plugins
  if (isDevMode()) {
    await import('rxdb/plugins/dev-mode').then((module) =>
      addRxPlugin(module.RxDBDevModePlugin)
    );
    // await import('rxdb/plugins/validate-ajv').then((module) => {
    //   storage = module.wrappedValidateAjvStorage({ storage });
    // });
  }

  const db = await createRxDatabase<RxEventsCollections>({
    name: 'feineddb',
    storage: getRxStorageDexie(),
  });
  console.log('DatabaseService: created database');

  await db.addCollections(collectionSettings);

  console.log('DatabaseService: create collections');

  // TODO: function get current week in helper, import here and WeekService
  const week = initWeek();
  await db.events.bulkInsert(
    [
      'A demo event',
      'Hover me to mark as complete',
      'This one has a color',
    ].map((title, idx) => ({
      id: 'event-' + idx,
      title,
      date: formatISO(startOfDay(week[idx].date), {
        representation: 'complete',
      }),
      completed: false,
      notes: '',
      color: '',
    } as RxEventDocumentType))
  );
  console.log('DatabaseService: bulk insert');

  return db;
}

/**
 * This is run via APP_INITIALIZER in app.module.ts
 */
export async function initDatabase(injector: Injector) {
    if (!injector) {
        throw new Error('initDatabase() injector missing');
    }

    await _createDb().then((db) => (DB_INSTANCE = db));;
}

@Injectable({
  providedIn: 'root',
})
export class DbService {

  constructor() {}

  get db() {
    return DB_INSTANCE;
  }
}
