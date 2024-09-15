import { AuthService } from './auth.service';
import { ModalService } from './modal.service';
import { UserService } from './user.service';
import { WeekService } from './week.service';

export const services = [AuthService, ModalService, UserService, WeekService];

export * from './auth.service';
export * from './modal.service';
export * from './user.service';
export * from './week.service';