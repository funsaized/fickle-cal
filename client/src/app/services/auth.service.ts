import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  checkCredentials(): any {
    const isAuth = sessionStorage.getItem('access_token');
    return isAuth != null;
  }
}
