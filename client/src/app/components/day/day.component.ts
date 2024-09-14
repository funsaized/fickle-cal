import { CommonModule } from '@angular/common';
import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { ParsedDay } from '../../models';
import { EventComponent } from '../event/event.component';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-day',
  standalone: true,
  imports: [CommonModule, EventComponent, ReactiveFormsModule],
  template: `
    <form class="day">
      <div class="header">
        <div class="date">{{ _day.monthDigits }}.{{ _day.dayDigits }}</div>
        <div class="day-name">{{ _day.dayName }}</div>
      </div>
      <div class="events-body">
        <app-event
          *ngFor="let event of events.controls; let i = index"
          [eventForm]="getControl(i)"
          [isEditable]="i === 0 || event.touched"
          (entered)="onEnter(i)"
        />
      </div>
    </form>
  `,
  styleUrl: './day.component.scss',
})
export class DayComponent {
  public _day!: ParsedDay;
  @Input()
  set day(day: ParsedDay) {
    this._day = day;
    const events = this._day?.events?.map((event) => {
      return new FormGroup({
        title: new FormControl(event.title, Validators.required),
      });
    });
    events.forEach((control) => control.markAsTouched());
    while (events.length < 4) {
      events.push(this.newControl());
    }
    this.events = new FormArray(events);
  }

  @ViewChildren(EventComponent) eventComponents!: QueryList<EventComponent>;
  events!: FormArray;

  constructor(private fb: FormBuilder) {
    this.events = new FormArray<FormGroup>([]);
  }

  onEnter(currentIndex: number) {
    const eventComponentsArray = this.eventComponents.toArray();
    const nextIndex = currentIndex + 1;
    if (nextIndex < eventComponentsArray.length) {
      const nextEventComponent = eventComponentsArray[nextIndex];
      nextEventComponent.textInput.nativeElement.focus();
    } else {
      this.events.push(
        new FormGroup({
          title: new FormControl('new One', Validators.required),
        })
      );
    }
  }

  getControl(i: number) {
    return this.events.at(i) as FormGroup;
  }

  newControl() {
    return new FormGroup({
      title: new FormControl('', Validators.required),
    });
  }
}
