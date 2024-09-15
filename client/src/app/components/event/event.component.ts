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
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CheckBoxComponent } from '../checkbox/checkbox.component';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CheckBoxComponent],
  template: `
    <form [formGroup]="_eventForm">
      <div
        class="input-root"
        (mouseover)="onMouseOver(_isEditable)"
        (mouseout)="onMouseOut()"
        [ngClass]="{ hover: hovered, focus: focused }"
      >
        <input
          #textInput
          id="name"
          type="text"
          formControlName="title"
          autocomplete="off"
          (focusout)="focused = false"
          (click)="onFocus()"
          (focusin)="onFocus()"
          (keydown.enter)="onEnter()"
          [class.completed]="completed"
        />
        <div class="checkbox">
          <app-checkbox formControlName="completed" />
        </div>
      </div>
    </form>
  `,
  styleUrl: './event.component.scss',
})
export class EventComponent {
  constructor(private fb: FormBuilder) {
    this._eventForm = this.fb.group({
      title: ['', [Validators.required]],
      completed: ['', [Validators.required]],
    });
  }

  @Output() entered = new EventEmitter<void>();

  _eventForm!: FormGroup;
  @Input()
  set eventForm(value: AbstractControl) {
    this._eventForm = value as FormGroup;
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

  get completed() {
    return this._eventForm.get('completed')?.value;
  }
}
