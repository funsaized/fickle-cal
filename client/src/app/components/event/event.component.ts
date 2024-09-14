import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="_eventForm">
      <div
        class="input-root"
        (mouseover)="onMouseOver(_isEditable)"
        (mouseout)="onMouseOut()"
        (click)="onFocus()"
        (focusin)="onFocus()"
        (focusout)="focused = false"
        [ngClass]="{ hover: hovered, focus: focused }"
      >
        <input
          #textInput
          id="name"
          type="text"
          formControlName="title"
          autocomplete="off"
          (keydown.enter)="onEnter()"
        />
      </div>
    </form>
  `,
  styleUrl: './event.component.scss',
})
export class EventComponent {
  constructor(private fb: FormBuilder) {
    this._eventForm = this.fb.group({
      title: ['', [Validators.required]],
    });
  }

  @Output() entered = new EventEmitter<void>();

  _eventForm!: FormGroup;
  @Input()
  set eventForm(value: FormGroup) {
    this._eventForm = value;
  }

  public _isEditable: boolean = false;
  // TODO: maybe directive b/c angular: https://netbasal.com/disabling-form-controls-when-working-with-reactive-forms-in-angular-549dd7b42110
  @Input()
  set isEditable(value: boolean) {
    this._isEditable = value;
    !this._isEditable && this._eventForm.disable();
  }

  @ViewChild('textInput', { read: ElementRef })
  textInput!: ElementRef<HTMLInputElement>;
  focused = false;
  hovered = false;

  onFocus() {
    this.focused = true;
  }

  onMouseOver(isEditable: boolean) {
    this.hovered = isEditable;
  }

  onMouseOut() {
    this.hovered = false;
  }

  onEnter() {
    this.entered.emit();
  }
}
