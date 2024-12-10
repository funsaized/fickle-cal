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
  debounceTime,
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
        [list]="eventService.getEventsStream$(_day.dayName) | async"
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
    readonly eventService: EventService
  ) {}

  ngOnInit() {
    // Load(s)
    this.subscription.add(
      this.day$
        .pipe(
          switchMap((day) => this.eventService.getDayStream$(day?.date)),
          debounceTime(100), // Allows for eager updating UI
          tap((events) => {
            console.log(
              'Events loaded for day',
              this._day$.value?.date,
              events
            );
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

        // Eagerly update the models driving UI
        this.eventService.setEventsMap(
          formatDate(event.prev.context.date, 'EEE', 'en-US') as CalendarKeys,
          previousList
        );
        const currentList = [...event.curr.list];
        currentList.splice(event.curr.index, 0, event.dragged);
        this.eventService.setEventsMap(
          this._day$.value?.dayName as CalendarKeys,
          currentList
        );
        await event.dragged?.incrementalPatch({
          date: formatISO(startOfDay(event.curr.context.date)),
        });

        // Update indices
        const prevUpdates = previousList.map((doc, index) =>
          doc.incrementalPatch({ index })
        );
        const currUpdates = currentList.map((doc, index) =>
          doc.incrementalPatch({ index })
        );
        await Promise.all([...prevUpdates, ...currUpdates]);
      }
    } else {
      const list = [...event.curr.list];
      const [removed] = list.splice(event.prev.index, 1);
      list.splice(event.curr.index, 0, removed);

      // Eagerly update the models driving UI
      this.eventService.setEventsMap(
        this._day$.value?.dayName as CalendarKeys,
        list
      );

      // Update indices
      await Promise.all(
        list.map((doc, index) => doc.incrementalPatch({ index }))
      );
    }
  }

  get day$() {
    return this._day$.asObservable().pipe(filter((day) => !!day));
  }
}
