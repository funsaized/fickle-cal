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
import { addDays } from 'date-fns';
import { After1971Pipe } from '../../pipes/after-1971.pipe';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OverlayModule, After1971Pipe],
  template: `
    <form [formGroup]="_eventForm">
      <div class="header">
        <ng-container *ngIf="date.value | after1971">
          <i class="bi bi-calendar-event"></i>
          <span class="date">
            {{ date.value | date: 'EEE, dd MMM yyyy' }}
          </span>
        </ng-container>
        <div class="actions">
          <button (click)="delete()">
            <i class="bi bi-trash"></i>
          </button>
          <button (click)="isColorPickerOpen = !isColorPickerOpen">
            <i class="bi bi-circle" cdkOverlayOrigin #colorTrigger="cdkOverlayOrigin"></i>
          </button>
          <button (click)="isGearOpen = !isGearOpen">
            <i
              class="bi bi-gear-wide-connected"
              cdkOverlayOrigin
              #gearTrigger="cdkOverlayOrigin"
            ></i>
          </button>
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
        <button (click)="onColorClick('transparent')"><i class="bi bi-circle"></i></button>
        <button (click)="onColorClick('red')">
          <i class="bi bi-circle-fill" style="color: red"></i>
        </button>
        <button (click)="onColorClick('yellow')">
          <i class="bi bi-circle-fill" style="color: yellow"></i>
        </button>
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
        <button *ngIf="date.value | after1971" (click)="moveToTomorrow()">
          <span class="text">Tomorrow</span>
          <i class="bi bi-arrow-right"></i>
        </button>
        <button *ngIf="date.value | after1971" (click)="moveToNextWeek()">
          <span class="text">Next Week</span>
          <i class="bi bi-calendar-week"></i>
        </button>
        <button *ngIf="date.value | after1971">
          <span class="text">Backlog</span>
          <i class="bi bi-list-task"></i>
        </button>
        <button (click)="copy()">
          <span class="text">Copy</span>
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
