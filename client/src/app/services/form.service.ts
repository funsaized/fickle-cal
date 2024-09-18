import { Injectable } from '@angular/core';
import { EventService } from './event.service';
import { FormControl, FormGroup } from '@angular/forms';
import {
  EventDetailFormValue,
  EventFormDay,
  ParsedDay,
} from '../models';
import { BehaviorSubject, filter, map, of, switchMap, take, tap, withLatestFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private _form$ = new BehaviorSubject<
    Record<EventFormDay, FormGroup<EventDetailFormValue>[]>
  >({
    Mon: [this._newForm(), this._newForm(), this._newForm(), this._newForm()],
    Tue: [this._newForm(), this._newForm(), this._newForm(), this._newForm()],
    Wed: [this._newForm(), this._newForm(), this._newForm(), this._newForm()],
    Thu: [this._newForm(), this._newForm(), this._newForm(), this._newForm()],
    Fri: [this._newForm(), this._newForm(), this._newForm(), this._newForm()],
    Sat: [this._newForm(), this._newForm(), this._newForm(), this._newForm()],
    Sun: [this._newForm(), this._newForm(), this._newForm(), this._newForm()],
  });

  constructor(private readonly eventService: EventService) {}

  public initFormForDay$(day: ParsedDay) {
    return this.eventService.getEventsAt$(day.date).pipe(
      switchMap((events) => {
        const formControls = events.map((event) => {
          const formValue: EventDetailFormValue = {
            id: new FormControl(event.id),
            title: new FormControl(event.title),
            date: new FormControl(event.date),
            completed: new FormControl(event.completed),
            notes: new FormControl(event.notes),
            color: new FormControl(event.color),
          };
          return new FormGroup<EventDetailFormValue>(formValue);
        });
        return of(formControls);
      }),
      withLatestFrom(this._form$.asObservable()),
      filter(([events, formsMap]) => events.length > 0),
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
        forms.push(this._newForm());
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
        forms[i].enable(); // TODO: disable logic so only initial empty is enabled
        formsMap[day.dayName as EventFormDay] = forms;
        this._form$.next(formsMap);
      })
    );
  }

  private _newForm() {
    return new FormGroup<EventDetailFormValue>({
      id: new FormControl(null),
      title: new FormControl(null),
      date: new FormControl(null),
      completed: new FormControl(false),
      notes: new FormControl(null),
      color: new FormControl(null),
    });
  }
}
