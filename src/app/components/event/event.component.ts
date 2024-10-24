import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
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
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';

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
            (click)="openEditModal()"
          >
            {{ title?.value }}
          </span>
        </ng-template>

        <app-checkbox formControlName="completed" />
      </div>
    </form>

    <ng-template #modalTemplate>
      <app-edit-event [eventForm]="_eventForm" id="1234" />
    </ng-template>
  `,
  styleUrl: './event.component.scss',
}) // TODO: make CVA component
export class EventComponent implements AfterViewInit {
  constructor(
    private viewContainerRef: ViewContainerRef,
    private fb: FormBuilder,
    private overlay: Overlay
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
  modalTemplate!: TemplateRef<unknown>;
  templatePortal: TemplatePortal<any> | null = null;
  overlayRef!: OverlayRef;

  @ViewChild('textInput', { read: ElementRef })
  textInput!: ElementRef<HTMLInputElement>;
  focused = false;
  hovered = false;

  ngAfterViewInit(): void {
    this.templatePortal = new TemplatePortal(
      this.modalTemplate,
      this.viewContainerRef
    );
  }

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

  openEditModal() {
    const config = new OverlayConfig({
      hasBackdrop: true,
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
    });
    this.overlayRef = this.overlay.create(config);
    this.overlayRef.attach(this.templatePortal);
    this.overlayRef.backdropClick().subscribe(() => {
      this.overlayRef.detach();
    });
  }

  get completed() {
    return this._eventForm.get('completed');
  }

  get title() {
    return this._eventForm.get('title');
  }
}
