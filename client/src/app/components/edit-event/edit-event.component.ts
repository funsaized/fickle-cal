import { Component, Input } from '@angular/core';
import { EventDetail } from '../../models';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // TODO: dynamically resize the textarea rows (height) based on content
  template: `
    <form
      *ngIf="_event$ | async as event"
      #formName="ngForm"
      (ngSubmit)="onSave(formName.value)"
    >
      <div class="header">
        <i class="bi bi-calendar-event"></i>
        <span class="date">{{
          event.day.date | date : 'EEE, dd MMM yyyy'
        }}</span>
      </div>
      <div class="container">
        <textarea
          class="title"
          name="title"
          id="title"
          rows="1"
          [ngModel]="event.title"
        ></textarea>
        <textarea
          class="notes"
          name="notes"
          id="notes"
          placeholder="Some extra notes go here..."
          [ngModel]="event.notes"
        ></textarea>
      </div>
    </form>
  `,
  styleUrls: ['./edit-event.component.scss'],
})
export class EditEventComponent {
  public _event$ = new BehaviorSubject<EventDetail | null>(null);
  public test = 'test';
  @Input()
  set id(id: string) {
    // TODO: remove testing stub
    this._event$.next(this.fetchEvent(+id));
  }

  constructor() {}
  fetchEvent(id: number): EventDetail {
    return {
      id: id,
      title: 'Event title',
      day: {
        date: new Date('2024-09-11'),
        isCurrent: false,
        events: [],
      },
      completed: false,
      notes: null,
      color: 'Orange',
    };
  }

  onSave(input: any) {
    throw new Error('Method not implemented.');
  }
}
