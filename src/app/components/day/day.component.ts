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
  Subscription,
  switchMap,
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
    readonly eventService: EventService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.day$
        .pipe(
          switchMap((day) => this.eventService.getDayStream$(day?.date)),
          debounceTime(100),
          tap((events) => {
            const dateKey = this.dateKey;
            console.log('Events loaded for day', dateKey, events);
            this.eventService.setEventsMap(dateKey, events || []);
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
        const prevDateKey = formatISO(startOfDay(event.prev.context.date));
        this.eventService.setEventsMap(prevDateKey, previousList);

        const currDateKey = formatISO(startOfDay(event.curr.context.date));
        const currentList = [...event.curr.list];
        currentList.splice(event.curr.index, 0, event.dragged);
        this.eventService.setEventsMap(currDateKey, currentList);

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
      const currDateKey = formatISO(startOfDay(event.curr.context.date));

      this.eventService.setEventsMap(currDateKey, list);

      // Update indices
      await Promise.all(
        list.map((doc, index) => doc.incrementalPatch({ index }))
      );
    }
  }

  get day$() {
    return this._day$.asObservable().pipe(filter((day) => !!day));
  }

  get dateKey(): string {
    return formatISO(startOfDay(this._day$.value!.date));
  }
}
