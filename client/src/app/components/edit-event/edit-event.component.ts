import { Component, Input } from '@angular/core';
import { EventDetail } from '../../models';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  // TODO: dynamically resize the textarea rows (height) based on content
  template: `
    <form [formGroup]="_eventForm">
      <div class="header">
        <i class="bi bi-calendar-event"></i>
        <span class="date">{{ date.value | date : 'EEE, dd MMM yyyy' }}</span>
      </div>
      <div class="container">
        <textarea
          class="title"
          name="title"
          id="title"
          rows="1"
          formControlName="title"
        ></textarea>
        <textarea
          class="notes"
          name="notes"
          id="notes"
          placeholder="Some extra notes go here..."
          formControlName="notes"
        ></textarea>
      </div>
    </form>
  `,
  styleUrls: ['./edit-event.component.scss'],
})
export class EditEventComponent {
  
  _eventForm!: FormGroup;
  @Input()
  set eventForm(value: FormGroup) {
    this._eventForm = value;
  }
  
  get date(): FormControl {
    return this._eventForm.get('date') as FormControl;
  }
}
