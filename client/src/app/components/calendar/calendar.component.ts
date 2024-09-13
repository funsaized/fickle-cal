import { Component } from '@angular/core';
import { Day, ParsedDay } from '../../models';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { EventComponent } from '../event/event.component';
import { WeekService } from '../../services';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, DatePipe, EventComponent],
  template: `
    <div class="container">
      <!-- TODO: day component -->
      <div class="day" *ngFor="let day of (weekService.currentDays$ | async)">
        <div class="header">
          <div class="date">{{ day.monthDigits }}.{{ day.dayDigits }}</div>
          <div class="day-name">{{ day.dayName }}</div>
        </div>
        <div class="events-body">
          <app-event
            *ngFor="let event of day.events; let i = index"
            [isEditable]="i === 0"
          />
        </div>
      </div>
    </div>
  `,
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {

  constructor(public readonly weekService: WeekService) {
  }
}
