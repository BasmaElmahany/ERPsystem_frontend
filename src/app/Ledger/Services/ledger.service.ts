import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from '../../Auth/Services/auth.service';
import { generaledger } from '../Models/ledger';
import { baseUrl } from '../../env';

@Injectable({
  providedIn: 'root'
})
export class LedgerService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  getAll(project: string): Observable<generaledger[]> {
     const encodedProject = encodeURIComponent(project);
    return this.http.get<{ list: generaledger[] }>(
      `${baseUrl}/${encodedProject}/reports/generaledger`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.list) 
    );
  }
}
