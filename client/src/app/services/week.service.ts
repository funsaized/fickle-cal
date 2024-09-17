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
    this._initializeCurrentWeek();
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

  private _initializeCurrentWeek(): void {
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek); // Set to Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Saturday

    const week = [];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      week.push({
        date: dayDate,
        isCurrent: false,
      });
    }
    this.dayPage = week;
  }
  
}
