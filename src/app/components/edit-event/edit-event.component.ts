import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { ConnectedPosition } from '@angular/cdk/overlay';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OverlayModule],
  template: `
    <form [formGroup]="_eventForm">
      <div class="header">
        <i class="bi bi-calendar-event"></i>
        <span class="date">{{ date.value | date : 'EEE, dd MMM yyyy' }}</span>
        <div class="actions">
          <i class="bi bi-trash"></i>
          <i
            (click)="isColorPickerOpen = !isColorPickerOpen"
            class="bi bi-circle"
            cdkOverlayOrigin
            #trigger="cdkOverlayOrigin"
          ></i>
          <i class="bi bi-gear-wide-connected"></i>
        </div>
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

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="isColorPickerOpen"
      [cdkConnectedOverlayPositions]="overlayPositions"
    >
      <div class="color-picker">
        <i class="bi bi-circle" 
        (click)="onColorClick('transparent')"
        ></i>
        <i
          class="bi bi-circle-fill"
          (click)="onColorClick('red')"
          style="color: red"
        ></i>
        <i
          class="bi bi-circle-fill"
          (click)="onColorClick('yellow')"
          style="color: yellow"
        ></i>
      </div>
    </ng-template>
  `,
  styleUrls: ['./edit-event.component.scss'],
})
export class EditEventComponent implements AfterViewInit {
  @ViewChild('textArea1') textArea1!: ElementRef;
  @ViewChild('textArea2') textArea2!: ElementRef;
  isColorPickerOpen = false;

  overlayPositions: ConnectedPosition[] = [
    {
      originX: 'center',
      originY: 'bottom',
      overlayX: 'center',
      overlayY: 'top',
    },
  ];

  ngAfterViewInit() {
    this.autoResize();
  }

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

  onColorClick(color: string) {
    this.color.setValue(color);
  }

  get date(): FormControl {
    return this._eventForm.get('date') as FormControl;
  }

  get color() {
    return this._eventForm.get('color') as FormControl;
  }
}
