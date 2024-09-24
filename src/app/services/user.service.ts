import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { User } from '../models';
import { enviroment } from '../../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _user = new ReplaySubject<User>(1);

  constructor(private http: HttpClient) {}

  fetchUser$(): Observable<User> {
    return this.http
      .get<User>(`${enviroment.baseUrl}/user`)
      .pipe(tap((user) => {
        console.log("Fetched user", user)
        this._user.next(user)
      }));
  }

  get user$() {
    return this._user.asObservable();
  }
}
