import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { User } from '../models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _user = new BehaviorSubject<User | null>(null);

  get user$() {
    return this._user.asObservable();
  }

  set user(user: User | null) {
    this._user.next(user);
  }

  get userFirstName$() {
    return this.user$.pipe(map(user => user?.name?.split(' ')?.[0]));
  }

  get userLastName$() {
    return this.user$.pipe(map(user => user?.name?.split(' ')?.[1]));
  }
}
