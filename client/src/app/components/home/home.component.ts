import { Component } from '@angular/core';
import { UserService } from '../../services';
import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import { catchError, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { HeaderComponent } from '..';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AsyncPipe, JsonPipe, HeaderComponent],
  template: `
    <div class="wrapper">
      <header>
        <app-header/>
      </header>
      <main>this is the stuff</main>
      <footer>Put footer stuff here</footer>
    </div>
  `,
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private subscription = new Subscription();

  constructor(
    public readonly userService: UserService,
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
