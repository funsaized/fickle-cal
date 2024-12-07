import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ParsedDay, ReOrderEvent } from '../../models';
import { ReactiveFormsModule } from '@angular/forms';
import {
  BehaviorSubject,
  debounceTime,
  filter,
  Observable,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { ListComponent } from '../list/list.component';
import { EventService, RxEventDocumentType } from '../../services';
import { RxDocument } from 'rxdb';
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
        [list]="events$ | async"
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
  events$ = new Observable<RxDocument<RxEventDocumentType>[] | null>();
  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly eventService: EventService
  ) {}

  async ngOnInit() {
    this.events$ = this._day$.pipe(
      filter((day) => !!day),
      switchMap((day) => this.eventService.getEventsAt$(day?.date)),
      debounceTime(100),
      take(1), // FIXME: should fire less. either change Observable getEventsAt$ to fire less or use debounceTime 
      tap((day) =>
        console.log('** Refreshing events for day', this._day$?.value?.date)
      )
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async reorder(event: ReOrderEvent) {
    console.log('REORDER EVENT', event);
    let updateDate = false;
    if (event.prev.container !== event.curr.container) {
      updateDate = true;
      await event.dragged?.incrementalPatch({
        date: formatISO(startOfDay(event.curr.context.date)),
      });
      if (event.list) {
        const list = [...event.list];
        list.splice(event.curr.index, 0, event.dragged);
        await Promise.all(
          list.map((doc, index) => doc.incrementalPatch({ index }))
        );
      }
    } else {
      // within container drag
      const list = [...event.list];
      const [removed] = list.splice(event.prev.index, 1);
      list.splice(event.curr.index, 0, removed);
      await Promise.all(
        list.map((doc, index) => doc.incrementalPatch({ index }))
      );
    }
  }
}
