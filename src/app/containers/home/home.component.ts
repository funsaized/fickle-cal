import { Component, OnInit } from '@angular/core';
import { EventService, WeekService } from '../../services';
import { CommonModule } from '@angular/common';
import {
  CalendarComponent,
  HeaderComponent,
  ListComponent,
} from '../../components';
import { ParsedDay, SOME_DAY_0, SOME_DAY_1, SOME_DAY_2 } from '../../models';
import { addDays, startOfDay } from 'date-fns';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, CalendarComponent, ListComponent],
  template: `
    <div class="wrapper">
      <header>
        <app-header
          [month]="(weekService.currentDays$ | async)?.[0]?.date"
          (arrowClick)="handleArrowClick($event)"
        />
      </header>
      <main>
        <app-calendar *ngIf="!loading" />
        <h2 style="opacity: 0.5">Backlog</h2>
        <div class="someday">
          <app-list [day]="someDay0" />
          <app-list [day]="someDay1" />
          <app-list [day]="someDay2" />
        </div>
      </main>
      <footer>An exercise on local first apps & syncing data structures</footer>
    </div>
  `,
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  loading = true;

  // Lazy backlog implementation..
  someDay0: ParsedDay;
  someDay1: ParsedDay;
  someDay2: ParsedDay;

  constructor(
    public readonly weekService: WeekService,
    private readonly eventService: EventService
  ) {
    this.someDay0 = {
      date: SOME_DAY_0,
      isCurrent: false,
      dayDigits: '00',
      dayName: 'N/A',
      monthDigits: '00',
    };

    this.someDay1 = {
      date: SOME_DAY_1,
      isCurrent: false,
      dayDigits: '00',
      dayName: 'N/A',
      monthDigits: '00',
    };

    this.someDay2 = {
      date: SOME_DAY_2,
      isCurrent: false,
      dayDigits: '00',
      dayName: 'N/A',
      monthDigits: '00',
    };
  }

  ngOnInit(): void {
    this.loading = false;
    this.eventService.events$.subscribe((events) => {
      this.loading = false;
    });
  }

  handleArrowClick(direction: string) {
    this.weekService.changeWeek(direction);
  }
}
