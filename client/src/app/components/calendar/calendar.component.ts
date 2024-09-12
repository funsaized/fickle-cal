import { Component } from '@angular/core';
import { Day, ParsedDay } from '../../models';
import { CommonModule, DatePipe, formatDate } from '@angular/common';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="container">
      <div class="day" *ngFor="let day of parsedDays">
        <div class="header">
          <div class="date">{{day.monthDigits}}.{{day.dayDigits}}</div>
          <div class="day">{{day.dayName}}</div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  days: Day[] = [
    {
      date: new Date('2024-09-09'),
      isCurrent: false,
      events: [],
    },
    {
      date: new Date('2024-09-10'),
      isCurrent: false,
      events: [],
    },
    {
      date: new Date('2024-09-11'),
      isCurrent: true,
      events: [],
    },
    {
      date: new Date('2024-09-12'),
      isCurrent: false,
      events: [],
    },
    {
      date: new Date('2024-09-13'),
      isCurrent: false,
      events: [],
    },
    {
      date: new Date('2024-09-14'),
      isCurrent: false,
      events: [],
    },
    {
      date: new Date('2024-09-15'),
      isCurrent: false,
      events: [],
    },
  ];

  parsedDays: ParsedDay[] = [];

  constructor() {
    this.parsedDays = this.days.map((day) => ({
      ...day,
      dayDigits: formatDate(day.date, 'dd', 'en-US'),
      dayName: formatDate(day.date, 'EEE', 'en-US'),
      monthDigits: formatDate(day.date, 'MM', 'en-US'),
    }));
  }
}
