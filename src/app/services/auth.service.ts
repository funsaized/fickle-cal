import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isAuth = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuth.asObservable();

  constructor(private http: HttpClient) {}

  initiateGithubAuth() {
    window.location.href = environment.baseUrl + '/auth/github';
  }

  isAuth$(): Observable<boolean> {
    return this.http
      .get<{ authenticated: boolean }>(`${environment.baseUrl}/auth/isLoggedIn`, {
        withCredentials: true,
      })
      .pipe(
        map(response => response.authenticated),
        tap(isAuthenticated => {
          this._isAuth.next(isAuthenticated);
        }),
        switchMap(() => this.isAuthenticated$),
        catchError(() => {
          this._isAuth.next(false);
          return of(false);
        }),
      );
  }

  logout(): Observable<unknown> {
    return this.http.post(`${environment.baseUrl}/auth/github/logout`, {}).pipe(
      tap(() => {
        this._isAuth.next(false);
      }),
    );
  }
}
