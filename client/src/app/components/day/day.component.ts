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
          [eventForm]="event"
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

    // TODO: abstract form creation to service when hooking up to API
    const events = this._day?.events?.map((event) => {
      return new FormGroup({
        title: new FormControl(event.title, [Validators.required]),
        completed: new FormControl(false, [Validators.required]),
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

  // User presses enter, add event conditions
  onEnter(currentIndex: number) {
    const eventComponentsArray = this.eventComponents.toArray();
    const currentInputValue = eventComponentsArray[currentIndex].textInput.nativeElement.value;
    const nextIndex = currentIndex + 1;
    if (currentInputValue.trim() !== ''){
      if (nextIndex < eventComponentsArray.length) {
        const nextEventComponent = eventComponentsArray[nextIndex];
        this.getControl(nextIndex).enable();
        nextEventComponent.textInput.nativeElement.focus();
      } else {
        const newEvent = this.newControl();
        newEvent.markAsTouched();
        this.events.push(newEvent);
        setTimeout(() => this.onEnter(currentIndex));
      }
    }
  }

  getControl(index: number) {
    return this.events.at(index);
  }

  newControl() {
    return new FormGroup({
      title: new FormControl<string | null>(null, [Validators.required]),
      completed: new FormControl(false, [Validators.required]),
    });
  }
}
