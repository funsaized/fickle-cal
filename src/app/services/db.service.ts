/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Injector, isDevMode } from '@angular/core';
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
import { RxReplicationState, replicateRxCollection } from 'rxdb/plugins/replication';
import { initWeek } from '../models';
import { formatISO, startOfDay } from 'date-fns';
import { HttpClient } from '@angular/common/http';
import { SlnConfigService } from './sln-config.service';

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
    timestamp: {
      type: 'number',
    },
    index: {
      type: 'number',
    },
    userId: {
      type: 'string',
      maxLength: 10,
    },
    _deleted: {
      type: 'boolean',
    },
  },
  required: ['id', 'title', 'date'],
  indexes: ['date', ['userId', 'date']],
} as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const schemaTyped = toTypedRxJsonSchema(EVENT_SCHEMA_LITERAL);

export type RxEventDocumentType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>;

export const EVENTS_SCHEMA: RxJsonSchema<RxEventDocumentType> = EVENT_SCHEMA_LITERAL;

const collectionSettings = {
  ['events']: {
    schema: EVENTS_SCHEMA,
  } as RxCollectionCreator<any>,
};

let DB_INSTANCE: RxEventsDatabase;

let REPLICATION_STATE: RxReplicationState<unknown, any>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface RxEventMethods {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type RxEventsCollection = RxCollection<RxEventDocumentType, RxEventMethods, {}, {}, unknown>;

export interface RxEventsCollections {
  events: RxEventsCollection;
}

export type RxEventsDatabase = RxDatabase<RxEventsCollections, any, any, unknown>;

export async function _createDb(): Promise<RxEventsDatabase> {
  // import dev-mode plugins
  if (isDevMode()) {
    await import('rxdb/plugins/dev-mode').then(module => addRxPlugin(module.RxDBDevModePlugin));
    // await import('rxdb/plugins/validate-ajv').then((module) => {
    //   storage = module.wrappedValidateAjvStorage({ storage });
    // });
  }

  // await removeRxDatabase('fickledb', getRxStorageDexie());

  const db = await createRxDatabase<RxEventsCollections>({
    name: 'fickledb',
    storage: getRxStorageDexie(),
  });
  console.log('#### DbService | RxDB | created database');

  await db.addCollections(collectionSettings);

  console.log('#### DbService | RxDB | create collections');

  // TODO: function get current week in helper, import here and WeekService
  const week = initWeek();
  await db.events.bulkInsert(
    [
      'A demo event',
      'Hover the corner to complete',
      'This one has a color',
      '👉 Drag & drop me 👉',
    ].map(
      (title, idx) =>
        ({
          id: 'event-' + idx,
          title,
          date: formatISO(startOfDay(week[idx].date), {
            representation: 'complete',
          }),
          completed: false,
          notes: '',
          color: '',
          index: 0,
          timestamp: new Date().getTime(),
        }) as RxEventDocumentType,
    ),
  );
  console.log('#### DbService | RxDB | bulk insert');

  return db;
}

/**
 * This is run via APP_INITIALIZER in app.module.ts
 */
export async function initDatabase(injector: Injector) {
  if (!injector) {
    throw new Error('initDatabase() injector missing');
  }

  // const httpClient = injector.get(HttpClient);

  await _createDb().then(db => (DB_INSTANCE = db));
}

@Injectable({
  providedIn: 'root',
})
export class DbService {
  constructor(
    private http: HttpClient,
    private slnConfigService: SlnConfigService,
  ) {}

  async initReplication() {
    const replicationState = await replicateRxCollection({
      collection: DB_INSTANCE.events,
      replicationIdentifier: 'fickle-http-replication',
      live: true,
      push: {
        handler: async (changeRows): Promise<{ _deleted: boolean }[]> => {
          const rawResponse = await this.http
            .post(`${this.slnConfigService.API_URL}/events-rpl/0/push`, changeRows, {
              withCredentials: true,
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            })
            .toPromise();
          return rawResponse as { _deleted: boolean }[];
        },
      },
      pull: {
        // TODO: types
        /*
          rxdb server format
          "checkpoint": {
              "id": "event-2",
              "lwt": 1730498389296.01
          }
        */
        handler: async (checkpointOrNull: any, batchSize) => {
          const updatedAt = checkpointOrNull ? checkpointOrNull.lwt : 0;
          const id = checkpointOrNull ? checkpointOrNull.id : '';
          const response = await this.http
            .get(
              `${this.slnConfigService.API_URL}/events-rpl/0/pull?lwt=${updatedAt}&id=${id}&limit=${batchSize}`,
              {
                withCredentials: true,
              },
            )
            .toPromise();
          const data = response as any;
          return {
            documents: data.documents,
            checkpoint: data.checkpoint,
          };
        },
      },
      // TODO: pullstream
    });

    REPLICATION_STATE = replicationState;

    // TODO: block clients that havent synced in X time
    // https://rxdb.info/replication.html#awaitinitialreplication-and-awaitinsync-should-not-be-used-to-block-the-application
    await replicationState.awaitInitialReplication();
    // emits each document that was received from the remote
    this.replicationState.received$.subscribe(doc =>
      console.log('#### DbService | RxDB | Rpl receieved ####', doc),
    );
    // emits each document that was send to the remote
    this.replicationState.sent$.subscribe(doc =>
      console.log('#### DbService | RxDB | Rpl sent ####', doc),
    );
    // emits all errors that happen when running the push- & pull-handlers.
    this.replicationState.error$.subscribe(error =>
      console.error(`#### DbService | RxDB | Rpl error ####`, error),
    );
    // emits true when the replication was canceled, false when not.
    this.replicationState.canceled$.subscribe(bool =>
      console.error(`#### DbService | RxDB | Rpl canceled ${bool} ####`),
    );
    // emits true when a replication cycle is running, false when not.
    this.replicationState?.active$.subscribe(bool =>
      console.log(`#### DbService | RxDB | Rpl cycle running ${bool} ####`),
    );
  }

  get db() {
    return DB_INSTANCE;
  }

  get replicationState() {
    return REPLICATION_STATE;
  }
}
