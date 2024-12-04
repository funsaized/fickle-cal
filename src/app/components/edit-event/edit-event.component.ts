import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { addDays, formatISO, startOfDay } from 'date-fns';

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
          <i class="bi bi-trash" (click)="delete()"></i>
          <i
            (click)="isColorPickerOpen = !isColorPickerOpen"
            class="bi bi-circle"
            cdkOverlayOrigin
            #colorTrigger="cdkOverlayOrigin"
          ></i>
          <i
            class="bi bi-gear-wide-connected"
            (click)="isGearOpen = !isGearOpen"
            cdkOverlayOrigin
            #gearTrigger="cdkOverlayOrigin"
          ></i>
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
      [cdkConnectedOverlayOrigin]="colorTrigger"
      [cdkConnectedOverlayOpen]="isColorPickerOpen"
      (backdropClick)="isColorPickerOpen = false"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      [cdkConnectedOverlayPositions]="[
        {
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
        },
      ]"
    >
      <div class="menu color-picker">
        <i class="bi bi-circle" (click)="onColorClick('transparent')"></i>
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

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="gearTrigger"
      [cdkConnectedOverlayOpen]="isGearOpen"
      (backdropClick)="isGearOpen = false"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      [cdkConnectedOverlayPositions]="[
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        },
      ]"
    >
      <div class="menu settings">
        <button>
          <span class="text" (click)="moveToTomorrow()">Tomorrow</span>
          <i class="bi bi-arrow-right"></i>
        </button>
        <button>
          <span class="text" (click)="moveToNextWeek()">Next Week</span>
          <i class="bi bi-calendar-week"></i>
        </button>
        <button>
          <span class="text">Backlog</span>
          <i class="bi bi-list-task"></i>
        </button>
        <button>
          <span class="text" (click)="copy()">Copy</span>
          <i class="bi bi-copy"></i>
        </button>
      </div>
    </ng-template>
  `,
  styleUrls: ['./edit-event.component.scss'],
})
export class EditEventComponent implements AfterViewInit {
  @ViewChild('textArea1') textArea1!: ElementRef;
  @ViewChild('textArea2') textArea2!: ElementRef;
  isColorPickerOpen = false;
  isGearOpen = false;
  @Output() greedyUpdate = new EventEmitter<void>();
  @Output() doCopy = new EventEmitter<void>();

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

  moveToTomorrow() {
    const tomorrow = addDays(this.date.value, 1);
    this.date.setValue(tomorrow);
    this.greedyUpdate.emit();
  }

  moveToNextWeek() {
    const nextWeek = addDays(this.date.value, 7);
    this.date.setValue(nextWeek);
    this.greedyUpdate.emit();
  }

  copy() {
    this.doCopy.emit();
  }

  delete() {
    this.deleted.setValue(true);
    this.greedyUpdate.emit();
  }

  get date(): FormControl {
    return this._eventForm.get('date') as FormControl;
  }

  get color() {
    return this._eventForm.get('color') as FormControl;
  }

  get deleted() {
    return this._eventForm.get('deleted') as FormControl;
  }
}
