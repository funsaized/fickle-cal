import { Component } from '@angular/core';
import { UserService } from '../../services';
import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import { catchError, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AsyncPipe, JsonPipe],
  template: ` <div>Home Component</div> `,
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
