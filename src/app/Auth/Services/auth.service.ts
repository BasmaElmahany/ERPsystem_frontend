import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenPayload, Userlogin, RegisterUserDto } from '../Models/auth';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
private readonly apiUrl = 'http://172.36.1.128:83/api/auth';
  private readonly tokenKey = 'jwt';
  private readonly userInfoKey = 'user-info';
  private readonly httpOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  constructor(private http: HttpClient) {}

  // ✅ Send login request
  login(data: Userlogin): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, data, this.httpOptions);
  }


  // ✅ Register a new user
/*  register(data: RegisterUserDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }*/




  register(data: RegisterUserDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/register`, data, this.httpOptions);
  }

  // ✅ Save token and decoded user info
  storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    const decoded = this.decodeToken(token);
    if (decoded) {
      localStorage.setItem(this.userInfoKey, JSON.stringify(decoded));
    }
  }


  // ✅ Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }



  // ✅ Decode JWT to get user info
  decodeToken(token?: string): TokenPayload | null {
    const jwt = token || this.getToken();
    if (!jwt) return null;

    try {
      return jwtDecode<TokenPayload>(jwt);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  
  // ✅ Get user info from localStorage (decoded)
  getUserInfo(): TokenPayload | null {
    const data = localStorage.getItem(this.userInfoKey);
    return data ? JSON.parse(data) : null;
  }

  // ✅ Clear stored token and user info
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userInfoKey);
  }


  isLoggedIn(): boolean {
  const token = this.getToken();
  if (!token) return false;

  const payload = this.decodeToken(token);
  if (!payload || !payload.exp) return false;

  const now = Math.floor(Date.now() / 1000);
  return payload['exp'] > now;
}
}
