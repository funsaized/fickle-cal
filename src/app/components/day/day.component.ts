import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ParsedDay, ReOrderEvent } from '../../models';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, debounceTime, filter, Subscription, switchMap, tap } from 'rxjs';
import { ListComponent } from '../list/list.component';
import { EventService } from '../../services';
import { formatISO, startOfDay } from 'date-fns';

@Component({
  selector: 'app-day',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ListComponent],
  template: `
    <form class="day" *ngIf="_day$ | async; let _day">
      <div class="header" [class.isCurrent]="_day.isCurrent">
        <div class="date">{{ _day.monthDigits }}.{{ _day.dayDigits }}</div>
        <div class="day-name">{{ _day.dayName }}</div>
      </div>
      <app-list
        [day]="_day"
        [list]="eventService.getEventsStream$(dateKey) | async"
        (reorder)="reorder($event)"
        [large]="true"
      />
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
  subscription = new Subscription();
  constructor(
    private readonly cdr: ChangeDetectorRef,
    readonly eventService: EventService,
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.day$
        .pipe(
          switchMap(day => this.eventService.getDayStream$(day?.date)),
          debounceTime(100),
          tap(events => {
            const dateKey = this.dateKey;
            console.log('Events loaded for day', dateKey, events);
            this.eventService.setEventsMap(dateKey, events || []);
          }),
        )
        .subscribe(),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async reorder(event: ReOrderEvent) {
    await this.eventService.reorder(event);
  }

  get day$() {
    return this._day$.asObservable().pipe(filter(day => !!day));
  }

  get dateKey(): string {
    return formatISO(startOfDay(this._day$.value!.date));
  }
}
