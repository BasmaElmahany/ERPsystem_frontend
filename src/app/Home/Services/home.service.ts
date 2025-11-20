import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../Auth/Services/auth.service';
import { baseUrl } from '../../env';
import { BalanceSheet, IncomeStatment, trialbalance } from '../Models/home';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }



  getTrailBalance(project: string): Observable<trialbalance[]> {
    const encodedProject = encodeURIComponent(project);
    return this.http.get<{ list: trialbalance[] }>(
      `${baseUrl}/${encodedProject}/reports/trial-balance`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.list)
    );
  }


  getIncomeStatement(project: string, from?: string, to?: string): Observable<IncomeStatment> {
    const encodedProject = encodeURIComponent(project);

    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;

    return this.http.get<{ list: IncomeStatment }>(
      `${baseUrl}/${encodedProject}/reports/income-statement`,
      {
        headers: this.getHeaders(),
        params: params
      }
    ).pipe(
      map(response => response.list)
    );
  }

  getBalanceSheet(project: string): Observable<BalanceSheet[]> {
    const encodedProject = encodeURIComponent(project);
    return this.http.get<{ list: BalanceSheet[] }>(
      `${baseUrl}/${encodedProject}/reports/balance-sheet`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.list)
    );
  }


}
