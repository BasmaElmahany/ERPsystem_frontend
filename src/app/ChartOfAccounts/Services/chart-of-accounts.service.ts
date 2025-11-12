import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../Auth/Services/auth.service';
import { Observable } from 'rxjs';
import { AccountList, ChartOfAccount } from '../Models/ChartOfAccount';

@Injectable({
  providedIn: 'root'
})
export class ChartOfAccountsService {
  private readonly baseUrl = '/api';
//private readonly localURL = 'https://localhost:44326/api/'; 
  constructor(private http: HttpClient, private auth: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  getAll(project: string): Observable<ChartOfAccount[]> {
    return this.http.get<ChartOfAccount[]>(`${this.baseUrl}/${project}/chart-of-accounts`, { headers: this.getHeaders() });
  }
  getList(project: string): Observable<AccountList[]> {
    return this.http.get<AccountList[]>(`${this.baseUrl}/${project}/chart-of-accounts/List`, { headers: this.getHeaders() });
  }
  getById(project: string, id: number): Observable<ChartOfAccount> {
    return this.http.get<ChartOfAccount>(`${this.baseUrl}/${project}/chart-of-accounts/${id}`, { headers: this.getHeaders() });
  }

  create(project: string, account: ChartOfAccount): Observable<ChartOfAccount> {
    return this.http.post<ChartOfAccount>(`${this.baseUrl}/${project}/chart-of-accounts`, account, { headers: this.getHeaders() });
  }

  update(project: string, id: number, account: ChartOfAccount): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${project}/chart-of-accounts/${id}`, account, { headers: this.getHeaders() });
  }

  delete(project: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${project}/chart-of-accounts/${id}`, { headers: this.getHeaders() });
  }
}
