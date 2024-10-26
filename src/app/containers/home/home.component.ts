import { Component, OnInit } from '@angular/core';
import { EventService, WeekService } from '../../services';
import { CommonModule } from '@angular/common';
import { CalendarComponent, HeaderComponent } from '../../components';
import { DbService } from '../../services/db.service';
import { switchMap, tap } from 'rxjs';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, CalendarComponent],
  template: `
    <div class="wrapper">
      <header>
        <app-header
          [month]="(weekService.currentDays$ | async)?.[0]?.date"
          (arrowClick)="handleArrowClick($event)"
        />
      </header>
      <main>
        <app-calendar *ngIf='!loading'/>
      </main>
      <footer>An exercise on local first apps & syncing data structures</footer>
    </div>
  `,
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit{

  loading = true;

  constructor(
    private dbService: DbService,
    public readonly weekService: WeekService,
    private readonly eventService: EventService,
  ) {}


  ngOnInit(): void {
      this.dbService.init$().pipe(
        switchMap(() => this.dbService.getAllEvents$()),
        tap((events) => this.eventService.events$ = events)
      ).subscribe(res => {
        this.loading = false;
        console.warn('Events:', res);
      });
  }

  handleArrowClick(direction: string) {
    this.weekService.changeWeek(direction);
  }
}
