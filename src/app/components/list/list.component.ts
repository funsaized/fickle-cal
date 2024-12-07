import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core';
import { ParsedDay } from '../../models';
import { EventComponent } from '../event/event.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EventService, RxEventDocumentType } from '../../services';
import {
  BehaviorSubject,
  first,
  Subject,
  Subscription,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { RxDocument } from 'rxdb';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CdkDropList,
    CdkDrag,
    CommonModule,
    EventComponent,
    ReactiveFormsModule,
  ],
  template: `
    <div
      cdkDropList
      (cdkDropListDropped)="drop($event)"
      class="list events-body"
      *ngIf="_day$ | async; let _day"
      [style.min-height]="large ? '420px' : '160px'"
    >
      <!-- <ng-container
        *ngIf="eventService.getEventsAt$(_day.date) | async as events"
      > -->
      <ng-container *ngIf="list">
        <span cdkDrag *ngFor="let event of list; let i = index">
          <app-event [event]="event" (updateForm)="updateForm()"></app-event>
        </span>
      </ng-container>
      <ng-container #newEvent></ng-container>
    </div>
  `,
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit, AfterViewInit, OnDestroy {
  public _day$ = new BehaviorSubject<ParsedDay | null>(null);
  @Input() large = false;
  @Input()
  set day(day: ParsedDay) {
    this._day$.next(day);
  }
  @Input() list: RxDocument<RxEventDocumentType>[] | null = null;
  @Output() reorder = new EventEmitter<{
    prev: number;
    curr: number;
  }>();
  @ViewChildren(EventComponent) eventComponents!: QueryList<EventComponent>;
  @ViewChild('newEvent', { read: ViewContainerRef })
  newEvent!: ViewContainerRef;
  subscription = new Subscription();
  private _updateForm$ = new Subject<string | null>();
  private _componentRef: ComponentRef<EventComponent> | null = null;

  constructor(
    public readonly eventService: EventService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this._updateForm$
        .pipe(
          withLatestFrom(this._day$.asObservable()),
          switchMap(() =>
            this.eventService.getEventsAt$(this._day$.value!.date).pipe(
              first(),
              tap((_) => this.createEventComponent()),
              tap((_) =>
                this._componentRef?.instance.textInput.nativeElement.focus()
              )
            )
          )
        )
        .subscribe()
    );
  }

  ngAfterViewInit(): void {
    this.createEventComponent();
    this.eventComponents.changes.subscribe((change) => {});
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  createEventComponent(): void {
    if (this.newEvent) {
      this.newEvent.clear();
      this._componentRef = this.newEvent.createComponent(EventComponent);
      this._componentRef.instance.date = this._day$.value?.date!;
      this._componentRef.instance.updateForm.subscribe(() => this.updateForm());
      this.cdr.detectChanges();
    }
  }

  updateForm() {
    this._updateForm$.next(null);
  }

  drop(event: CdkDragDrop<string[]>) {
    this.reorder.emit({
      prev: event.previousIndex,
      curr: event.currentIndex,
    });
  }
}
