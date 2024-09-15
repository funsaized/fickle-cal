import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CheckBoxComponent,
      multi: true,
    },
  ],
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      class="bi bi-check"
      viewBox="0 0 16 16"
      (click)="toggle()"
      [ngClass]="{ checked: checked }"
    >
      <path
        d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"
      />
    </svg>
  `,
  styleUrl: './checkbox.component.scss',
})
export class CheckBoxComponent implements ControlValueAccessor {
  checked = false;
  private onTouched!: () => void;
  private onChanged!: (value: boolean) => void;

  constructor() {}

  writeValue(value: boolean): void {
    this.checked = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChanged = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  toggle() {
    this.checked = !this.checked;
    this.onChanged(this.checked);
  }
}
