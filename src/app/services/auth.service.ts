import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isAuth = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuth.asObservable();

  constructor(private http: HttpClient) {}

  initiateGithubAuth() {
    // Instead of making an HTTP request, redirect the browser
    window.location.href = environment.baseUrl + '/auth/github';
  }

  // logout(): Observable<any> {
  //   return this.http.post('/api/auth/logout', {}).pipe(
  //     tap(() => {
  //       this.isAuthenticatedSubject.next(false);
  //     }),
  //   );
  // }
}
