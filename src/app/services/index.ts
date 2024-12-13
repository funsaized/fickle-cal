import { DbService } from './db.service';
import { EventService } from './event.service';
import { FormService } from './form.service';
import { UserService } from './user.service';
import { WeekService } from './week.service';

export const services = [DbService, EventService, FormService, UserService, WeekService];

export * from './db.service';
export * from './event.service';
export * from './form.service';
export * from './user.service';
export * from './week.service';