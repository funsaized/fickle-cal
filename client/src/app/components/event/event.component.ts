import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CheckBoxComponent } from '../checkbox/checkbox.component';
import { EditEventComponent } from '../edit-event/edit-event.component';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CheckBoxComponent,
    EditEventComponent,
  ],
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

        <app-checkbox formControlName="completed" />
      </div>
    </form>

    <ng-template #modalTemplate>
      <div class="modal">
        <div class="modal-content">
          <app-edit-event id="1234" />
        </div>
      </div>
      <div class="modal-backdrop" (click)="closeEditModal()"></div>
    </ng-template>
  `,
  styleUrl: './event.component.scss',
}) // TODO: make CVA component
export class EventComponent {
  constructor(
    private viewContainerRef: ViewContainerRef,
    private fb: FormBuilder
  ) {
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

  @ViewChild('modalTemplate', { read: TemplateRef })
  modalTemplate!: TemplateRef<any>;
  @ViewChild('textInput', { read: ElementRef })
  textInput!: ElementRef<HTMLInputElement>;
  private modalViewRef: EmbeddedViewRef<any> | null = null;
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
    this.modalViewRef = this.viewContainerRef.createEmbeddedView(template);
  }

  closeEditModal() {
    this.modalViewRef?.destroy();
  }

  get completed() {
    return this._eventForm.get('completed');
  }

  get title() {
    return this._eventForm.get('title');
  }
}
