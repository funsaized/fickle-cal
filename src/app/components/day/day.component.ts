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
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormService } from '../../services';
import { BehaviorSubject, Subject, Subscription, switchMap, withLatestFrom } from 'rxjs';

@Component({
  selector: 'app-day',
  standalone: true,
  imports: [CommonModule, EventComponent, ReactiveFormsModule],
  template: `
    <form class="day" *ngIf="_day$ | async; let _day">
      <div class="header">
        <div class="date">{{ _day.monthDigits }}.{{ _day.dayDigits }}</div>
        <div class="day-name">{{ _day.dayName }}</div>
      </div>
      <div class="events-body">
        <app-event
          *ngFor="
            let form of formService.getForms$(_day) | async;
            let i = index
          "
          [eventForm]="form"
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
  subscription = new Subscription();
  private _updateForm$ = new Subject<number | null>();

  constructor(private fb: FormBuilder, public formService: FormService) {}

  ngOnInit(): void {

    this.subscription.add(this._updateForm$.pipe(
      withLatestFrom(this._day$.asObservable()),
      switchMap(([i, day]) => {
        if (i=== null) {
          return this.formService.addControlToDay$(day!);
        } else {
          return this.formService.enableControlForDay$(day!, i);
        }
      })
    ).subscribe());

    this.subscription.add(
      this._day$
        .pipe(switchMap((day) => this.formService.initFormForDay$(day!)))
        .subscribe((forms) => {
          console.log('Init form for day ', forms);
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
        this._updateForm$.next(nextIndex);
        nextEventComponent.textInput.nativeElement.focus();
      } else {
        this._updateForm$.next(null);
        setTimeout(() => this.onEnter(currentIndex));
      }
    }
  }

  newControl() {
    return new FormGroup({
      title: new FormControl<string | null>(null, [Validators.required]),
      completed: new FormControl(false, [Validators.required]),
    });
  }
}
