import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { DbService, EventService, WeekService } from '../../services';
import { CommonModule } from '@angular/common';
import { CalendarComponent, FaqComponent, HeaderComponent, ListComponent } from '../../components';
import { ParsedDay, ReOrderEvent, SOME_DAY_0, SOME_DAY_1, SOME_DAY_2 } from '../../models';
import { formatISO, startOfDay } from 'date-fns';
import { debounceTime, filter, map, Subscription, tap } from 'rxjs';
import { CdkDrag, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CdkDropListGroup,
    CdkDrag,
    CommonModule,
    HeaderComponent,
    CalendarComponent,
    ListComponent,
    FaqComponent
  ],
  template: `
    <div class="wrapper">
      <header>
        <app-header
          [month]="(weekService.currentDays$ | async)?.[0]?.date"
          (arrowClick)="handleArrowClick($event)"
        />
      </header>
      <main cdkDropListGroup>
        <app-calendar *ngIf="!loading" />
        <h2 style="opacity: 0.5">Backlog</h2>
        <div class="someday">
          <app-list
            [day]="someDay0"
            [list]="eventService.getEventsStream$(formatDateKey(someDay0.date)) | async"
            (reorder)="reorder($event)"
          />
          <app-list
            [day]="someDay1"
            [list]="eventService.getEventsStream$(formatDateKey(someDay1.date)) | async"
            (reorder)="reorder($event)"
          />
          <app-list
            [day]="someDay2"
            [list]="eventService.getEventsStream$(formatDateKey(someDay2.date)) | async"
            (reorder)="reorder($event)"
          />
        </div>
      </main>
    </div>

    <ng-template #modalTemplate>
      <app-faq/>
    </ng-template>
  `,
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  loading = true;
  subscription = new Subscription();

  // Lazy backlog implementation... I mean who uses these dates anyway ;)
  someDay0: ParsedDay;
  someDay1: ParsedDay;
  someDay2: ParsedDay;

  @ViewChild('modalTemplate', { read: TemplateRef })
  modalTemplate!: TemplateRef<unknown>;
  templatePortal: TemplatePortal<unknown> | null = null;
  overlayRef!: OverlayRef;

  constructor(
    public readonly weekService: WeekService,
    readonly eventService: EventService,
    private readonly dbService: DbService,
    private activatedRoute: ActivatedRoute,
    private viewContainerRef: ViewContainerRef,
    private overlay: Overlay,
  ) {
    this.someDay0 = {
      date: SOME_DAY_0,
      isCurrent: false,
      dayDigits: '00',
      dayName: 'SOMEDAY0',
      monthDigits: '00',
    };

    this.someDay1 = {
      date: SOME_DAY_1,
      isCurrent: false,
      dayDigits: '00',
      dayName: 'SOMEDAY1',
      monthDigits: '00',
    };

    this.someDay2 = {
      date: SOME_DAY_2,
      isCurrent: false,
      dayDigits: '00',
      dayName: 'SOMEDAY2',
      monthDigits: '00',
    };
    console.warn('HomeComponent: constructor', activatedRoute);
  }

  ngOnInit(): void {
    this.loading = false;
    // Load(s)
    [this.someDay0, this.someDay1, this.someDay2].forEach(day => {
      const dateKey = formatISO(startOfDay(day.date));
      this.subscription.add(
        this.eventService
          .getDayStream$(day.date)
          .pipe(
            debounceTime(100),
            tap(events => {
              console.log('Events loaded for day', dateKey, events);
              this.eventService.setEventsMap(dateKey, events || []);
            }),
          )
          .subscribe(),
      );
    });

    // Replication
    // FIXME: refactor for async best practices
    this.activatedRoute.data
      .pipe(
        map(data => data['user']),
        tap(user => {
          if (!user) {
            console.log('No user found, opening modal...');
            setTimeout(() => this.openModal(), 1000);
          }
        }),
        filter(user => !!user),
      )
      .subscribe(async user => {
        if (user) {
          console.log('User resolved, updating event ownership...', user);
          await this.eventService.updateAllWithOwner(user.id);
          console.log('Events updated with id', user.id);
          console.log('Beginning replication...');
          await this.dbService.initReplication();
        }
      });
  }

  ngAfterViewInit(): void {
    this.templatePortal = new TemplatePortal(this.modalTemplate, this.viewContainerRef);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  openModal() {
    const config = new OverlayConfig({
      hasBackdrop: true,
      positionStrategy: this.overlay.position().global().end().top('2%'),
    });
    this.overlayRef = this.overlay.create(config);
    this.overlayRef.attach(this.templatePortal);
    this.overlayRef.backdropClick().subscribe(() => {
      this.overlayRef.detach();
    });
  }

  handleArrowClick(direction: string) {
    this.weekService.changeWeek(direction);
  }

  async reorder(event: ReOrderEvent) {
    await this.eventService.reorder(event);
  }

  formatDateKey(date: Date): string {
    return formatISO(startOfDay(date));
  }
}
