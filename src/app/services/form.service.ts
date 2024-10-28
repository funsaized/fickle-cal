import { Injectable } from '@angular/core';
import { EventService } from './event.service';
import { FormControl, FormGroup } from '@angular/forms';
import {
  EventDetailFormValue,
  EventFormDay,
  ParsedDay,
  FormsMap,
} from '../models';
import {
  BehaviorSubject,
  filter,
  map,
  of,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs';
import { WeekService } from './week.service';
import { parseISO } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private _form$ = new BehaviorSubject<FormsMap>({
    Sun: [],
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
  });

  constructor(
    private readonly eventService: EventService,
    private readonly weekService: WeekService
  ) {
    this.weekService.dayPage$
      .pipe
      // TODO: intelligently get events for the focused week
      // skip(1),
      ()
      .subscribe((days) => {
        this._form$.next({
          Sun: [this._newForm(days[0].date)],
          Mon: [this._newForm(days[1].date)],
          Tue: [this._newForm(days[2].date)],
          Wed: [this._newForm(days[3].date)],
          Thu: [this._newForm(days[4].date)],
          Fri: [this._newForm(days[5].date)],
          Sat: [this._newForm(days[6].date)],
        });
      });
  }

  public initFormForDay$(day: ParsedDay) {
    return this.eventService.getEventsAt$(day.date).pipe(
      switchMap((events) => {
        const formControls = events.map((event) => {
          const formValue: EventDetailFormValue = {
            id: new FormControl(event.id),
            title: new FormControl(event.title),
            date: new FormControl(parseISO(event.date)),
            completed: new FormControl(event.completed || false),
            notes: new FormControl(event.notes || null),
            color: new FormControl(event.color || null),
          };
          return new FormGroup<EventDetailFormValue>(formValue);
        });
        return of(formControls);
      }),
      withLatestFrom(this._form$.asObservable()),
      filter(([events, _]) => events.length > 0),
      tap(([formControls, form]) => {
        form[day.dayName as EventFormDay] = formControls;
        this._form$.next(form);
      }),
      map(([formControls, _]) => formControls)
    );
  }

  getForms$(day: ParsedDay) {
    return this._form$.pipe(map((form) => form[day.dayName as EventFormDay]));
  }

  addControlToDay$(day: ParsedDay) {
    return this.getForms$(day).pipe(
      withLatestFrom(this._form$.asObservable()),
      take(1),
      tap(([forms, formsMap]) => {
        forms.push(this._newForm(day.date));
        formsMap[day.dayName as EventFormDay] = forms;
        this._form$.next(formsMap);
      })
    );
  }

  enableControlForDay$(day: ParsedDay, i: number) {
    return this.getForms$(day).pipe(
      withLatestFrom(this._form$.asObservable()),
      take(1),
      tap(([forms, formsMap]) => {
        formsMap[day.dayName as EventFormDay] = forms;
        this._form$.next(formsMap);
      })
    );
  }

  private _newForm(date: Date) {
    return new FormGroup<EventDetailFormValue>({
      id: new FormControl(null),
      title: new FormControl(null),
      date: new FormControl(date),
      completed: new FormControl(false),
      notes: new FormControl(null),
      color: new FormControl(null),
    });
  }
}
