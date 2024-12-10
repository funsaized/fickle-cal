import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeekService } from '../../services';
import { DayComponent } from '../day/day.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, DayComponent],
  template: `
    <div class="container" >
      <app-day
        *ngFor="let day of weekService.currentDays$ | async"
        [day]="day"
      />
    </div>
  `,
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  constructor(public readonly weekService: WeekService) {}
}
