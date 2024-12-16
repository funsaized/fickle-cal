import { DbService } from './db.service';
import { EventService } from './event.service';
import { FormService } from './form.service';
import { WeekService } from './week.service';

export const services = [DbService, EventService, FormService, WeekService];

export * from './db.service';
export * from './event.service';
export * from './form.service';
export * from './week.service';
