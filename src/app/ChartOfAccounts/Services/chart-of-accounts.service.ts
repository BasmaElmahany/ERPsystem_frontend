import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../Auth/Services/auth.service';
import { map, Observable } from 'rxjs';
import { AccountList, AccountWithChartDto, ChartOfAccount } from '../Models/ChartOfAccount';
import { baseUrl } from '../../env';

@Injectable({
  providedIn: 'root'
})
export class ChartOfAccountsService {
  //private readonly localURL = 'https://localhost:44326/api/'; 
  constructor(private http: HttpClient, private auth: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  getAll(project: string): Observable<ChartOfAccount[]> {
    return this.http.get<{list:ChartOfAccount[]}>(`${baseUrl}/${project}/chart-of-accounts`, { headers: this.getHeaders() }).pipe(
      map(response => response.list) // ⬅️ unwrap here
    );
  }
  getList(project: string): Observable<AccountList[]> {
    return this.http.get<{list:AccountList[]}>(`${baseUrl}/${project}/chart-of-accounts/List`, { headers: this.getHeaders() }).pipe(
      map(response => response.list) // ⬅️ unwrap here
    );
  }
  getById(project: string, id: number): Observable<ChartOfAccount> {
    return this.http.get<ChartOfAccount>(`${baseUrl}/${project}/chart-of-accounts/${id}`, { headers: this.getHeaders() });
  }
  getFullById(project: string, id: number): Observable<AccountWithChartDto> {
    return this.http.get<AccountWithChartDto>(
      `${baseUrl}/${project}/chart-of-accounts/${id}/dto`,
      { headers: this.getHeaders() }
    );
  }

  create(project: string, account: AccountWithChartDto): Observable<any> {
    return this.http.post(`${baseUrl}/${project}/chart-of-accounts`, account, {
      headers: this.getHeaders()
    });
  }

  update(project: string, id: number, account: AccountWithChartDto): Observable<void> {
    return this.http.put<void>(`${baseUrl}/${project}/chart-of-accounts/${id}`, account, {
      headers: this.getHeaders()
    });
  }

  delete(project: string, id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/${project}/chart-of-accounts/${id}`, { headers: this.getHeaders() });
  }
}
