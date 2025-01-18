import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SessionStorageService } from './session-storage.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor(private readonly localStorageService: LocalStorageService) {
    const theme = this.localStorageService.getItem('theme');
    if (theme) {
      this.setTheme(theme as 'light' | 'dark');
    }
  }

  private _theme$ = new BehaviorSubject<'light' | 'dark'>('light');
  theme$ = this._theme$.asObservable();

  toggleTheme() {
    const current = this._theme$.value;
    const newTheme = current === 'light' ? 'dark' : 'light';
    document.body.className = `${newTheme}-theme`;
    this._theme$.next(newTheme);
    this.localStorageService.setItem('theme', newTheme);
  }

  setTheme(theme: 'light' | 'dark') {
    document.body.className = `${theme}-theme`;
    this._theme$.next(theme);
  }
}
