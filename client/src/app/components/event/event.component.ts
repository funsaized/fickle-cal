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
      (mouseover)="onMouseOver()"
      (mouseout)="onMouseOut()"
      (click)="onFocus()"
      (focusin)="onFocus()"
      (focusout)="focused = false"
      [ngClass]="{ hover: hovered, focus: focused }"
    >
      <input id="name" type="text" [formControl]="text" autocomplete="off"/>
    </div>
  `,
  styleUrl: './event.component.scss',
})
export class EventComponent {
  focused = false;
  hovered = false;
  text = new FormControl('');

  onFocus() {
    this.focused = true;
  }

  onMouseOver() {
    console.log('RUNNING OVER');
    this.hovered = true;
  }

  onMouseOut() {
    console.log('RUNNING OUT');
    this.hovered = false;
  }
}
