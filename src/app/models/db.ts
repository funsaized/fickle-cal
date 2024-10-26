import { isDevMode } from '@angular/core';
import {
  addRxPlugin,
  createRxDatabase,
  RxCollection,
  RxJsonSchema,
} from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { formatISO, isToday, startOfDay } from 'date-fns';

export type EventDocType = {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  notes: string;
  color: string;
};
// TODO: move to helper
export const initWeek = () => {
  const currentDate = new Date();
  const currentDayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek); // Set to Sunday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Saturday

  const week = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + i);
    week.push({
      date: startOfDay(dayDate),
      isCurrent: isToday(dayDate),
    });
  }

  return week;
};

export const databasePromise = (async () => {
  // import dev-mode plugins
  if (isDevMode()) {
    await import('rxdb/plugins/dev-mode').then((module) =>
      addRxPlugin(module.RxDBDevModePlugin)
    );
    // await import('rxdb/plugins/validate-ajv').then((module) => {
    //   storage = module.wrappedValidateAjvStorage({ storage });
    // });
  }

  const db = await createRxDatabase<{
    events: RxCollection<EventDocType, {}>;
  }>({
    name: 'feineddb',
    storage: getRxStorageDexie(),
  });

  await db.addCollections({
    events: {
      schema: {
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
            format: "date-time",
            maxLength: 30.
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
      } as RxJsonSchema<EventDocType>,
    },
  });

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
      date: formatISO(startOfDay(week[idx].date), { representation: 'complete' }),
      completed: false,
      notes: '',
      color: '',
    }))
  );

  return db;
})();
