import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CalendarKeys, ParsedDay, ReOrderEvent } from '../../models';
import { ReactiveFormsModule } from '@angular/forms';
import {
  BehaviorSubject,
  filter,
  Observable,
  Subject,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { ListComponent } from '../list/list.component';
import { EventService, RxEventDocumentType } from '../../services';
import { RxDocument } from 'rxdb';
import { formatISO, startOfDay } from 'date-fns';
import { formatDate } from '@angular/common';

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
        [list]="eventService.getEventsMap(_day.dayName)"
        (reorder)="reorder($event)"
        (refresh)="eventService.dayRefresh$ = _day.date"
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
  events$ = new Observable<RxDocument<RxEventDocumentType>[] | null>();
  constructor(
    private readonly cdr: ChangeDetectorRef,
    readonly eventService: EventService
  ) {}

  ngOnInit() {
    // Initial load
    this.day$
      .pipe(
        switchMap((day) => this.eventService.getDayStream$(day?.date)),
        take(1),
        tap((events) => {
          console.log('Events loaded for day', this._day$.value?.date, events);
          this.eventService.setEventsMap(
            this._day$.value?.dayName as CalendarKeys,
            events || []
          );
        })
      )
      .subscribe();

    // Previous day refresh subscription
    this.subscription.add(
      this.eventService.prevDayRefresh$
        .pipe(
          filter((prevDay) => prevDay === this._day$.value?.date),
          switchMap(() =>
            this.eventService
              .getDayStream$(this._day$.value!.date)
              .pipe(take(1))
          ),
          tap((events) => {
            this.eventService.setEventsMap(
              this._day$.value?.dayName as CalendarKeys,
              events || []
            );
          })
        )
        .subscribe()
    );

    // Current day refresh subscription
    this.subscription.add(
      this.eventService.dayRefresh$
        .pipe(
          filter((currDay) => currDay === this._day$.value?.date),
          switchMap(() =>
            this.eventService
              .getDayStream$(this._day$.value!.date)
              .pipe(take(1))
          ),
          tap((events) => {
            this.eventService.setEventsMap(
              this._day$.value?.dayName as CalendarKeys,
              events || []
            );
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async reorder(event: ReOrderEvent) {
    if (event.prev.container !== event.curr.container) {
      // If no list, then add event and update index
      if (!event.curr.list) {
        await event.dragged?.incrementalPatch({ index: event.curr.index });
      } else {
        // Remove from previous, put in new, immediately update UI
        const previousList = [...event.prev.list];
        previousList.splice(event.prev.index, 1);
        this.eventService.setEventsMap(
          formatDate(event.prev.context.date, 'EEE', 'en-US') as CalendarKeys,
          previousList
        );
        await event.dragged?.incrementalPatch({
          date: formatISO(startOfDay(event.curr.context.date)),
        });
        const currentList = [...event.curr.list];
        currentList.splice(event.curr.index, 0, event.dragged);
        this.eventService.setEventsMap(
          this._day$.value?.dayName as CalendarKeys,
          currentList
        );

        // Update indices
        const prevUpdates = previousList.map((doc, index) =>
          doc.incrementalPatch({ index })
        );
        const currUpdates = currentList.map((doc, index) =>
          doc.incrementalPatch({ index })
        );
        await Promise.all([...prevUpdates, ...currUpdates]);
        this.eventService.prevDayRefresh$ = event.prev.context.date;
      }
    } else {
      const list = [...event.curr.list];
      const [removed] = list.splice(event.prev.index, 1);
      list.splice(event.curr.index, 0, removed);

      // Immediately update the UI
      this.eventService.setEventsMap(
        this._day$.value?.dayName as CalendarKeys,
        list
      );

      // Update indices
      await Promise.all(
        list.map((doc, index) => doc.incrementalPatch({ index }))
      );

      this.eventService.dayRefresh$ = this._day$.value!.date;
    }
  }

  get day$() {
    return this._day$.asObservable().pipe(filter((day) => !!day));
  }
}
