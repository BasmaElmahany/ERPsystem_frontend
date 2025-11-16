import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../Auth/Services/auth.service';
import { map, Observable } from 'rxjs';
import { AccountList, AccountWithChartDto, ChartOfAccount, CreateChartResponse } from '../Models/ChartOfAccount';
import { baseUrl } from '../../env';

@Injectable({
  providedIn: 'root'
})
export class ChartOfAccountsService {

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  /** GET all Chart Of Accounts */
  getAll(project: string): Observable<ChartOfAccount[]> {
    return this.http
      .get<{ list: ChartOfAccount[] }>(
        `${baseUrl}/${project}/chart-of-accounts`,
        { headers: this.getHeaders() }
      )
      .pipe(map(res => res.list));
  }

  /** GET List of simple accounts */
  getList(project: string): Observable<AccountList[]> {
    return this.http
      .get<{ list: AccountList[] }>(
        `${baseUrl}/${project}/chart-of-accounts/list`,
        { headers: this.getHeaders() }
      )
      .pipe(map(res => res.list));
  }

  /** GET account by ID */
  getById(project: string, id: number): Observable<ChartOfAccount> {
    return this.http.get<ChartOfAccount>(
      `${baseUrl}/${project}/chart-of-accounts/${id}`,
      { headers: this.getHeaders() }
    );
  }

  /** GET full DTO */
  getFullById(project: string, id: number): Observable<AccountWithChartDto> {
    return this.http.get<AccountWithChartDto>(
      `${baseUrl}/${project}/chart-of-accounts/${id}/dto`,
      { headers: this.getHeaders() }
    );
  }

  /** CREATE new chart/account pair */
create(project: string, account: AccountWithChartDto): Observable<AccountWithChartDto> {
  return this.http.post<any>(
    `${baseUrl}/${project}/chart-of-accounts`,
    account,
    { headers: this.getHeaders() }
  ).pipe(
    map(res => ({
      id: res.chart.id,
      accountCode: res.chart.accountCode,
      accountName: res.chart.accountName,
      accountType: res.chart.accountType,
      isDetail: res.chart.isDetail,
      parentAccountId: res.chart.parentAccountId,

      // balance data from account
      openingBalance: res.account.openingBalance,
      balance: res.account.balance,
      currency: res.account.currency
    }))
  );
}

  /** UPDATE */
  update(project: string, id: number, account: AccountWithChartDto): Observable<void> {
    return this.http.put<void>(
      `${baseUrl}/${project}/chart-of-accounts/${id}`,
      account,
      { headers: this.getHeaders() }
    );
  }

  /** DELETE */
  delete(project: string, id: number): Observable<void> {
    return this.http.delete<void>(
      `${baseUrl}/${project}/chart-of-accounts/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
