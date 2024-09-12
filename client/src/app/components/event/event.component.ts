import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="input-root"
      (click)="onFocus()"
      (focusin)="onFocus()"
      (focusout)="onBlur()"
      [ngClass]="focused ? 'focus' : ''"
    >
      <input id="name" type="text" [formControl]="text" />
    </div>
  `,
  styleUrl: './event.component.scss',
})
export class EventComponent {
  focused = false;
  text = new FormControl('');

  onFocus() {
    this.focused = true;
  }

  onBlur() {
    this.focused = false;
  }
}
