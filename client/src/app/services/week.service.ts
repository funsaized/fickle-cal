import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Day, ParsedDay } from '../models';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class WeekService {
  private _dayPage$ = new BehaviorSubject<Day[]>([]);
  private _currentDays$ = new BehaviorSubject<ParsedDay[]>([]);

  constructor(private http: HttpClient) {
    this._dayPage$.asObservable().subscribe((days) => {
      this._currentDays$.next(
        days.map((day) => ({
          ...day,
          dayDigits: formatDate(day.date, 'dd', 'en-US'),
          dayName: formatDate(day.date, 'EEE', 'en-US'),
          monthDigits: formatDate(day.date, 'MM', 'en-US'),
        }))
      );
    });
  }

  set dayPage(days: Day[]) {
    this._dayPage$.next(days);
  }

  get currentDays$() {
    return this._currentDays$.asObservable();
  }
}
