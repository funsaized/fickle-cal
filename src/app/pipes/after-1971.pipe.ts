import { Pipe, PipeTransform } from '@angular/core';
import { isAfter, parseISO } from 'date-fns';

// Lazy backlog implementation..
@Pipe({
  name: 'after1971',
  standalone: true,
})
export class After1971Pipe implements PipeTransform {
  transform(date: Date): boolean {
    const compareDate = new Date(1971, 0, 1); // January 1, 1971
    return isAfter(date, compareDate);
  }
}
