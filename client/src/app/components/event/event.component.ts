import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
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
        [formControl]="text"
        autocomplete="off"
        (keydown.enter)="onEnter()"
      />
    </div>
  `,
  styleUrl: './event.component.scss',
})
export class EventComponent {
  @ViewChild('textInput', { read: ElementRef })
  textInput!: ElementRef<HTMLInputElement>;

  @Output() entered = new EventEmitter<void>();

  public _isEditable: boolean = false;

  // TODO: maybe directive b/c angular: https://netbasal.com/disabling-form-controls-when-working-with-reactive-forms-in-angular-549dd7b42110
  @Input() // TOOD: check if this has a value to enable also
  set isEditable(value: boolean) {
    this._isEditable = value;
    if (!value) {
      // this.text.disable();
    } else {
      this.text.enable();
    }
  }

  focused = false;
  hovered = false;
  text = new FormControl('');

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
    console.error("RAN")
    this.entered.emit();
  }
}
