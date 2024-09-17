import { Injectable } from '@angular/core';
import { WeekService } from './week.service';
import { EventService } from './event.service';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { EventDetail, EventDetailFormValue, ParsedDay } from '../models';
import { of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private _eventsForm!: FormArray;
  // private _eventsForm = 

  constructor(private readonly eventService: EventService) {
    this._eventsForm = new FormArray<FormGroup<EventDetailFormValue>>([]);
  }

  public initFormForDay$(date: Date) {
    return this.eventService.getEventsAt$(date).pipe(
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
      tap((forms) => forms.forEach((form) => this._eventsForm.push(form)))
    );
  }
}
