import { Component } from '@angular/core';
import { UserService, WeekService } from '../../services';
import { CommonModule } from '@angular/common';
import { catchError, Subscription } from 'rxjs';
import { Router } from '@angular/router';
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
export class HomeComponent {
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
}
