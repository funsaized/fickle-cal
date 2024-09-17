import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
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
import { EventService, FormService } from '../../services';
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-day',
  standalone: true,
  imports: [CommonModule, EventComponent, ReactiveFormsModule],
  template: `
    <form class="day">
      <div class="header" *ngIf="_day$ | async; let _day">
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
export class DayComponent implements OnInit, OnDestroy {
  public _day$ = new BehaviorSubject<ParsedDay | null>(null);
  @Input()
  set day(day: ParsedDay) {
    this._day$.next(day);
  }

  @ViewChildren(EventComponent) eventComponents!: QueryList<EventComponent>;
  events!: FormArray;
  subscription = new Subscription();
  constructor(private fb: FormBuilder, private formService: FormService) {
    this.events = new FormArray<FormGroup>([]);
  }

  ngOnInit(): void {
    this.subscription.add(
      this._day$
        .pipe(switchMap((day) => this.formService.initFormForDay$(day!.date)))
        .subscribe((forms) => {
          console.error("Init form for day ", forms)
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // User presses enter, add event conditions
  onEnter(currentIndex: number) {
    const eventComponentsArray = this.eventComponents.toArray();
    const currentInputValue =
      eventComponentsArray[currentIndex].textInput.nativeElement.value;
    const nextIndex = currentIndex + 1;
    if (currentInputValue.trim() !== '') {
      if (nextIndex < eventComponentsArray.length) {
        const nextEventComponent = eventComponentsArray[nextIndex];
        this.getControl(nextIndex).enable();
        nextEventComponent.textInput.nativeElement.focus();
      } else {
        this.events.push(this.newControl());
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
