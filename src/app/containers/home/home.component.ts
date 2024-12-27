import { Component, OnDestroy, OnInit } from '@angular/core';
import { DbService, EventService, WeekService } from '../../services';
import { CommonModule } from '@angular/common';
import { CalendarComponent, HeaderComponent, ListComponent } from '../../components';
import { ParsedDay, ReOrderEvent, SOME_DAY_0, SOME_DAY_1, SOME_DAY_2 } from '../../models';
import { formatISO, startOfDay } from 'date-fns';
import { debounceTime, Subscription, tap } from 'rxjs';
import { CdkDrag, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CdkDropListGroup,
    CdkDrag,
    CommonModule,
    HeaderComponent,
    CalendarComponent,
    ListComponent,
  ],
  template: `
    <div class="wrapper">
      <header>
        <app-header
          [month]="(weekService.currentDays$ | async)?.[0]?.date"
          (arrowClick)="handleArrowClick($event)"
        />
      </header>
      <main cdkDropListGroup>
        <app-calendar *ngIf="!loading" />
        <h2 style="opacity: 0.5">Backlog</h2>
        <div class="someday">
          <app-list
            [day]="someDay0"
            [list]="eventService.getEventsStream$(formatDateKey(someDay0.date)) | async"
            (reorder)="reorder($event)"
          />
          <app-list
            [day]="someDay1"
            [list]="eventService.getEventsStream$(formatDateKey(someDay1.date)) | async"
            (reorder)="reorder($event)"
          />
          <app-list
            [day]="someDay2"
            [list]="eventService.getEventsStream$(formatDateKey(someDay2.date)) | async"
            (reorder)="reorder($event)"
          />
        </div>
      </main>
    </div>
  `,
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  loading = true;
  subscription = new Subscription();

  // Lazy backlog implementation... I mean who uses these dates anyway ;)
  someDay0: ParsedDay;
  someDay1: ParsedDay;
  someDay2: ParsedDay;

  constructor(
    public readonly weekService: WeekService,
    readonly eventService: EventService,
    private activatedRoute: ActivatedRoute,
    private readonly dbService: DbService,
  ) {
    this.someDay0 = {
      date: SOME_DAY_0,
      isCurrent: false,
      dayDigits: '00',
      dayName: 'SOMEDAY0',
      monthDigits: '00',
    };

    this.someDay1 = {
      date: SOME_DAY_1,
      isCurrent: false,
      dayDigits: '00',
      dayName: 'SOMEDAY1',
      monthDigits: '00',
    };

    this.someDay2 = {
      date: SOME_DAY_2,
      isCurrent: false,
      dayDigits: '00',
      dayName: 'SOMEDAY2',
      monthDigits: '00',
    };
    console.warn('HomeComponent: constructor', activatedRoute);
  }

  ngOnInit(): void {
    this.loading = false;
    // Load(s)
    [this.someDay0, this.someDay1, this.someDay2].forEach(day => {
      const dateKey = formatISO(startOfDay(day.date));
      this.subscription.add(
        this.eventService
          .getDayStream$(day.date)
          .pipe(
            debounceTime(100),
            tap(events => {
              console.log('Events loaded for day', dateKey, events);
              this.eventService.setEventsMap(dateKey, events || []);
            }),
          )
          .subscribe(),
      );
    });

    // Replication
    this.activatedRoute.data.subscribe(async ({ user }) => {
      // do something with your resolved data ...
      if (user) {
        console.log('User resolved, beginning replication...', user);
        await this.dbService.initReplication();
      }
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleArrowClick(direction: string) {
    this.weekService.changeWeek(direction);
  }

  async reorder(event: ReOrderEvent) {
    await this.eventService.reorder(event);
  }

  formatDateKey(date: Date): string {
    return formatISO(startOfDay(date));
  }
}
