import { CommonModule } from '@angular/common';
import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { ParsedDay } from '../../models';
import { EventComponent } from '../event/event.component';

@Component({
  selector: 'app-day',
  standalone: true,
  imports: [CommonModule, EventComponent],
  template: `
    <div class="day">
      <div class="header">
        <div class="date">{{ day.monthDigits }}.{{ day.dayDigits }}</div>
        <div class="day-name">{{ day.dayName }}</div>
      </div>
      <div class="events-body">
        <app-event
          *ngFor="let event of day.events; let i = index"
          [isEditable]="i === 0"
          (entered)="focusNext(i)"
        />
      </div>
    </div>
  `,
  styleUrl: './day.component.scss',
})
export class DayComponent {
  @Input() day!: ParsedDay;
  @ViewChildren(EventComponent) eventComponents!: QueryList<EventComponent>;

  constructor() {}

  focusNext(currentIndex: number) {
    const eventComponentsArray = this.eventComponents.toArray();
    const nextIndex = currentIndex + 1;
    if (nextIndex < eventComponentsArray.length) {
      const nextEventComponent = eventComponentsArray[nextIndex];
      console.error(nextEventComponent);
      nextEventComponent.textInput.nativeElement.focus();
    }
  }
}
