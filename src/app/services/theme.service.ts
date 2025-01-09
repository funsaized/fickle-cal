import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _theme$ = new BehaviorSubject<'light' | 'dark'>('light');
  theme$ = this._theme$.asObservable();

  toggleTheme() {
    const current = this._theme$.value;
    const newTheme = current === 'light' ? 'dark' : 'light';
    document.body.className = `${newTheme}-theme`;
    this._theme$.next(newTheme);
  }

  setTheme(theme: 'light' | 'dark') {
    document.body.className = `${theme}-theme`;
    this._theme$.next(theme);
  }
}
