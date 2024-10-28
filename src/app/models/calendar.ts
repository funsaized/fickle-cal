import { FormControl, FormGroup } from "@angular/forms";
import { isToday, startOfDay } from 'date-fns';

export interface Day {
  date: Date;
  isCurrent: boolean;
}
export interface ParsedDay extends Day {
  dayDigits: string; // e.g '09'
  dayName: string; // e.g 'Mon'
  monthDigits: string; // e.g '09'
}

export interface EventDetail {
  id: number | null;
  title: string | null;
  date: Date;
  completed: boolean;
  notes: string | null;
  color: string | null;
}

export interface EventDetailFormValue {
  id: FormControl<string | null>;
  title: FormControl<string | null>;
  date: FormControl<Date | null>;
  completed: FormControl<boolean | null>;
  notes: FormControl<string | null>;
  color: FormControl<string | null>;
}

export type EventFormDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type FormsMap = Record<EventFormDay, FormGroup<EventDetailFormValue>[]>;

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

