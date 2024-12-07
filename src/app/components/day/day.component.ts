import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { ParsedDay } from '../../models';
import { ReactiveFormsModule } from '@angular/forms';
import {
  BehaviorSubject,
  filter,
  firstValueFrom,
  Observable,
  Subscription,
  switchMap,
  take,
} from 'rxjs';
import { ListComponent } from '../list/list.component';
import { EventService, RxEventDocumentType } from '../../services';
import { RxDocument } from 'rxdb';

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
      <app-list [day]="_day" [list]="events" (reorder)="reorder($event)" [large]="true" />
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
  events: RxDocument<RxEventDocumentType>[] | null = null;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly eventService: EventService
  ) {}

  async ngOnInit() {
    this.subscription.add(
      this._day$
        .pipe(
          filter((day) => !!day),
          switchMap((day) => this.eventService.getEventsAt$(day?.date)),
          take(1)
        )
        .subscribe((events) => {
          this.events = events;
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  reorder(event: { prev: number; curr: number }) {
    if (!this.events) return;
    
    const events = [...this.events];
    const [removed] = events.splice(event.prev, 1);
    events.splice(event.curr, 0, removed);
    this.events = events;
  }
}
