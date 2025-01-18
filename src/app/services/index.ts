import { DbService } from './db.service';
import { EventService } from './event.service';
import { FormService } from './form.service';
import { WeekService } from './week.service';
import { ThemeService } from './theme.service';
import { UserService } from './user.service';
import { SessionStorageService } from './session-storage.service';
import { LocalStorageService } from './local-storage.service';

export const services = [
  DbService,
  EventService,
  FormService,
  WeekService,
  ThemeService,
  UserService,
  SessionStorageService,
  LocalStorageService,
];

export * from './db.service';
export * from './event.service';
export * from './form.service';
export * from './week.service';
export * from './theme.service';
export * from './user.service';
export * from './session-storage.service';
export * from './local-storage.service';
