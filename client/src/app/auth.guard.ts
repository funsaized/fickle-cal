import { CanActivateFn, Router } from '@angular/router';
import { UserService } from './services';
import { inject } from '@angular/core';
import { catchError, map, of, pipe } from 'rxjs';

// TODO
export const AuthGuard: CanActivateFn = (route, state) => {
  const isAuth = true;
  const userService = inject(UserService);
  const router = inject(Router);
  if (isAuth) {
    return true;
    // return userService.fetchUser$().pipe(
    //   map(user => user != null ? true: false),
    //   catchError((err) => {
    //     console.error(err);
    //     router.navigate(['/error']);
    //     return of(false);
    //   })
    // );
  }
  return false;
};
