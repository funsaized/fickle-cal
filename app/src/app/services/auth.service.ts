import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { UserService } from './user.service';
import { IsLoggedInResponse } from '../models';
import { SlnConfigService } from './sln-config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isAuth = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuth.asObservable();

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private slnConfigService: SlnConfigService,
  ) {}

  initiateGithubAuth() {
    window.location.href = this.slnConfigService.API_URL + '/auth/github';
  }

  isAuth$(): Observable<boolean> {
    return this.http
      .get<IsLoggedInResponse>(`${this.slnConfigService.API_URL}/auth/isLoggedIn`, {
        withCredentials: true, // TODO: interceptor
      })
      .pipe(
        tap(response => {
          if (response.authenticated) {
            this.userService.user = response.user;
          }
        }),
        map(response => response.authenticated),
        tap(isAuthenticated => {
          this._isAuth.next(isAuthenticated);
        }),
        switchMap(() => this.isAuthenticated$),
        catchError(error => {
          console.log('#### AuthService | Error checking auth', error);
          this._isAuth.next(false);
          return of(false);
        }),
      );
  }

  logout$(): Observable<unknown> {
    return this.http
      .post(`${this.slnConfigService.API_URL}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this._isAuth.next(false);
          this.userService.user = null;
        }),
      );
  }
}
