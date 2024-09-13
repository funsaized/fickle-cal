import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { WeekService } from './week.service';

export const services = [AuthService, UserService, WeekService];

export * from './auth.service';
export * from './user.service';
export * from './week.service';