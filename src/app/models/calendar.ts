import { FormControl, FormGroup } from "@angular/forms";

export interface Day {
  date: Date;
  isCurrent: boolean;
}
export interface ParsedDay extends Day {
  dayDigits: string; // e.g '09'
  dayName: string; // e.g 'Mon;
  monthDigits: string; // e.g '09'
}

export interface Event {
  title: string | null;
}

export interface EventDetail extends Event {
  id: number | null;
  date: Date;
  completed: boolean;
  notes: string | null;
  color: string | null;
}

export interface EventDetailFormValue {
  id: FormControl<number | null>;
  title: FormControl<string | null>;
  date: FormControl<Date | null>;
  completed: FormControl<boolean | null>;
  notes: FormControl<string | null>;
  color: FormControl<string | null>;
}

export type EventFormDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type FormsMap = Record<EventFormDay, FormGroup<EventDetailFormValue>[]>;