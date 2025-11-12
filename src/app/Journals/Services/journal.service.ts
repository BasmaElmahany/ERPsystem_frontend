import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../Auth/Services/auth.service';
import { CreateJournalDto, JournalEntry, JournalWithLines } from '../Models/journal';
import { Observable } from 'rxjs';
import { baseUrl } from '../../env';

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  constructor(private http: HttpClient, private auth: AuthService) { }

    private getHeaders(): HttpHeaders {
      const token = this.auth.getToken();
      let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);
      return headers;
    }


    
  // 🟢 Create new journal entry
  create(project: string, dto: CreateJournalDto): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(
      `${baseUrl}/${project}/journals`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  // 🟢 Update existing journal entry
  update(project: string, id: number, dto: CreateJournalDto): Observable<void> {
    return this.http.put<void>(
      `${baseUrl}/${project}/journals/${id}`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  // 🟢 Get a single journal entry with its lines
  getById(project: string, id: number): Observable<JournalWithLines> {
    return this.http.get<JournalWithLines>(
      `${baseUrl}/${project}/journals/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // 🟢 Get all journal entries (summary list)
  getAll(project: string): Observable<JournalEntry[]> {
    return this.http.get<JournalEntry[]>(
      `${baseUrl}/${project}/journals`,
      { headers: this.getHeaders() }
    );
  }

  // 🟢 Post a journal entry (mark as posted)
  post(project: string, id: number): Observable<void> {
    return this.http.post<void>(
      `${baseUrl}/${project}/journals/${id}/post`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // 🟢 Unpost a journal entry (reverse posting)
  unpost(project: string, id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${baseUrl}/${project}/journals/${id}/unpost`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // 🟢 Delete a journal entry
  delete(project: string, id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${baseUrl}/${project}/journals/${id}`,
      { headers: this.getHeaders() }
    );
  }
}

