import { Component, OnInit } from '@angular/core';
import { UserService, WeekService } from '../../services';
import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import { catchError, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Day } from '../../models';
import { CalendarComponent, HeaderComponent } from '../../components';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    CalendarComponent,
  ],
  template: `
    <div class="wrapper">
      <header>
        <app-header />
      </header>
      <main><app-calendar /></main>
      <footer>Put footer stuff here</footer>
    </div>
  `,
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit{
  days: Day[] = [
    {
      date: new Date('2024-09-09'),
      isCurrent: false,
      events: [],
    },
    {
      date: new Date('2024-09-10'),
      isCurrent: false,
      events: [],
    },
    {
      date: new Date('2024-09-11'),
      isCurrent: true,
      events: [{ title: 'Event something' }],
    },
    {
      date: new Date('2024-09-12'),
      isCurrent: false,
      events: [
        { title: 'Event 1' },
        { title: 'Event 2' },
        { title: 'Event 3' },
        { title: 'Event 4' },
      ],
    },
    {
      date: new Date('2024-09-13'),
      isCurrent: false,
      events: [],
    },
    {
      date: new Date('2024-09-14'),
      isCurrent: false,
      events: [],
    },
    {
      date: new Date('2024-09-15'),
      isCurrent: false,
      events: [],
    },
  ];

  private subscription = new Subscription();

  constructor(
    public readonly userService: UserService,
    private readonly weekService: WeekService,
    private readonly router: Router
  ) {
    this.subscription.add(
      this.userService
        .fetchUser$()
        .pipe(catchError((err) => this.router.navigate(['/error'])))
        .subscribe()
    );
  }

  // TODO: api call
  ngOnInit(): void {
      this.weekService.dayPage = this.days;
  }
}
