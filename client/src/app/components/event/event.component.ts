import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
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
import { ModalService } from '../../services';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CheckBoxComponent],
  template: `
    <form [formGroup]="_eventForm">
      <div
        class="input-root"
        (mouseover)="onMouseOver()"
        (mouseout)="onMouseOut()"
        [ngClass]="{ hover: hovered, focus: focused }"
      >
        <input
          *ngIf="!title?.value || focused; else placeHolder"
          #textInput
          id="name"
          type="text"
          formControlName="title"
          autocomplete="off"
          (focusout)="focused = false"
          (click)="onFocus()"
          (focusin)="onFocus()"
          (keydown.enter)="onEnter()"
          [class.completed]="completed?.value === true"
        />
        <ng-template #placeHolder>
          <span
            [class.completed]="completed?.value === true"
            (click)="openEditModal(modalTemplate)"
          >
            {{ title?.value }}
          </span>
        </ng-template>
        <div class="checkbox">
          <app-checkbox formControlName="completed" />
        </div>
      </div>
    </form>

    <ng-template #modalTemplate>
      <h2>This is my custom modal content</h2>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores
        voluptatibus facilis eum adipisci neque ipsam sed provident distinctio
        veniam minima, voluptates quas ex voluptatem quasi vero aliquam iste
        quaerat illum.
      </p>
    </ng-template>
  `,
  styleUrl: './event.component.scss',
})
export class EventComponent {
  constructor(private modalService: ModalService, private fb: FormBuilder) {
    this._eventForm = this.fb.group({
      title: [, [Validators.required]],
      completed: ['', [Validators.required]],
    });
  }

  @Output() entered = new EventEmitter<void>();

  _eventForm!: FormGroup;
  @Input()
  set eventForm(value: AbstractControl) {
    this._eventForm = value as FormGroup;
  }

  @ViewChild('textInput', { read: ElementRef })
  textInput!: ElementRef<HTMLInputElement>;
  focused = false;
  hovered = false;

  onFocus() {
    this.focused = true;
  }

  onMouseOver() {
    this.hovered = true;
  }

  onMouseOut() {
    this.hovered = false;
  }

  onEnter() {
    this.entered.emit();
  }

  openEditModal(template: TemplateRef<any>) {
    this.modalService
      .open(template, {}) // TODO: options if needed
      .subscribe((action) => {
        console.log('modalAction', action);
      });
  }

  get completed() {
    return this._eventForm.get('completed');
  }

  get title() {
    return this._eventForm.get('title');
  }
}
