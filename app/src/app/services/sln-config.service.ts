import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SlnConfigService {
  public readonly API_URL: string = '';

  constructor() {
    this.API_URL = environment.production
      ? `${environment.baseUrl}${environment.apiUrl}`
      : `${environment.baseUrl}`;
  }
}
