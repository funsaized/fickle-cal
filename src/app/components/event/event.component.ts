import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CheckBoxComponent } from '../checkbox/checkbox.component';
import { EditEventComponent } from '../edit-event/edit-event.component';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { FormService } from '../../services';
import { DbService, RxEventDocumentType } from '../../services/db.service';
import { RxDocument } from 'rxdb';
import { formatISO, parseISO } from 'date-fns';
import { filter, switchMap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

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
          (focusout)="onFocusOut()"
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
export class EventComponent implements OnInit, AfterViewInit {
  constructor(
    private readonly formService: FormService,
    private readonly dbService: DbService,
    private viewContainerRef: ViewContainerRef,
    private fb: FormBuilder,
    private overlay: Overlay
  ) {
    this._eventForm = this.fb.group({
      title: [, [Validators.required]],
      completed: ['', [Validators.required]],
    });
  }

  @Output() updateForm = new EventEmitter<void>();

  _eventForm!: FormGroup;

  private _event!: RxDocument<RxEventDocumentType>;
  @Input()
  set event(value: RxDocument<RxEventDocumentType>) {
    this._event = value;
    this._eventForm = this.formService.newForm(parseISO(this._event.date), {
      id: this._event.id,
      title: this._event.title,
      date: this._event.date,
      completed: this._event.completed,
      notes: this._event.notes,
      color: this._event.color,
    });
  }

  private _date!: Date;
  @Input()
  set date(value: Date) {
    this._date = value;
    this._eventForm = this.formService.newForm(this._date);
  }

  @ViewChild('modalTemplate', { read: TemplateRef })
  modalTemplate!: TemplateRef<unknown>;
  templatePortal: TemplatePortal<any> | null = null;
  overlayRef!: OverlayRef;

  @ViewChild('textInput', { read: ElementRef })
  textInput!: ElementRef<HTMLInputElement>;
  focused = false;
  hovered = false;

  ngOnInit() {
    // Greedily subscribe to all changes and persist immediately
    this.title?.valueChanges
      .pipe(
        filter(() => this._event != null),
        switchMap((value: string) => {
          return this._event.incrementalPatch({ title: value });
        })
      )
      .subscribe();

    this.completed?.valueChanges
      .pipe(
        filter(() => this._event != null),
        switchMap((value) => this._event.incrementalPatch({ completed: value }))
      )
      .subscribe();

    this.notes?.valueChanges
      .pipe(
        filter(() => this._event != null),
        switchMap((value) => this._event.incrementalPatch({ notes: value }))
      )
      .subscribe();

    this.color?.valueChanges
      .pipe(
        filter(() => this._event != null),
        switchMap((value) => this._event.incrementalPatch({ color: value }))
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    this.templatePortal = new TemplatePortal(
      this.modalTemplate,
      this.viewContainerRef
    );
  }

  onFocus() {
    this.focused = true;
  }

  async onFocusOut() {
    if (!this._event && this.title?.value) {
      this._event = await this.dbService.db.events.insert({
        id: 'event-' + uuidv4(),
        title: this.title?.value || '',
        date: formatISO(this._date),
        completed: false,
        notes: '',
        color: '',
        timestamp: formatISO(new Date()),
      });
      this.focused = false;
      this.updateForm.emit();
    } else {
      this.focused = false;
    }
  }

  onMouseOver() {
    this.hovered = true;
  }

  onMouseOut() {
    this.hovered = false;
  }

  async onEnter() {
    await this.onFocusOut();
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

  get id() {
    return this._eventForm.get('id');
  }

  get title() {
    return this._eventForm.get('title');
  }

  get dateForm() {
    return this._eventForm.get('date');
  }

  get completed() {
    return this._eventForm.get('completed');
  }

  get notes() {
    return this._eventForm.get('notes');
  }

  get color() {
    return this._eventForm.get('color');
  }
}
