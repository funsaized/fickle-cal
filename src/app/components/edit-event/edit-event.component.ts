import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="_eventForm">
      <div class="header">
        <i class="bi bi-calendar-event"></i>
        <span class="date">{{ date.value | date : 'EEE, dd MMM yyyy' }}</span>
      </div>
      <div class="container">
        <textarea
          #textArea1
          class="title"
          name="title"
          id="title"
          rows="1"
          formControlName="title"
          (input)="autoResize()"
        ></textarea>
        <textarea
          #textArea2
          class="notes"
          name="notes"
          id="notes"
          placeholder="Some extra notes go here..."
          formControlName="notes"
          (input)="autoResize()"
        ></textarea>
      </div>
    </form>
  `,
  styleUrls: ['./edit-event.component.scss'],
})
export class EditEventComponent {
  @ViewChild('textArea1') textArea1!: ElementRef;
  @ViewChild('textArea2') textArea2!: ElementRef;

  _eventForm!: FormGroup;
  @Input()
  set eventForm(value: FormGroup) {
    this._eventForm = value;
  }

  // greedy resize function
  autoResize() {
    const textArea1 = this.textArea1.nativeElement;
    textArea1.style.height = '0px';
    textArea1.style.height = textArea1.scrollHeight + 'px';

    const textArea2 = this.textArea2.nativeElement;
    textArea2.style.height = '0px';
    textArea2.style.height = textArea2.scrollHeight + 'px';
  }

  get date(): FormControl {
    return this._eventForm.get('date') as FormControl;
  }
}
