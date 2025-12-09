import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../Auth/Services/auth.service';
import { CreateJournalDto, JournalEntry, JournalWithLines } from '../Models/journal';
import { map, Observable } from 'rxjs';
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
  create(project: string, formData: FormData): Observable<{ id: number }> {
    const encodedProject = encodeURIComponent(project);

    return this.http.post<{ id: number }>(
      `${baseUrl}/${encodedProject}/journals`,
      formData
    );
  }


  update(project: string, id: number, formData: FormData): Observable<void> {
    const encodedProject = encodeURIComponent(project);

    return this.http.put<void>(
      `${baseUrl}/${encodedProject}/journals/${id}`,
      formData   // 🔥 send FormData just like POST
    );
  }

  // 🟢 Get a single journal entry with its lines
  getById(project: string, id: number): Observable<JournalWithLines> {
    const encodedProject = encodeURIComponent(project);
    return this.http.get<JournalWithLines>(
      `${baseUrl}/${encodedProject}/journals/${id}`,
      { headers: this.getHeaders() }
    );
  }

  getAll(project: string): Observable<JournalEntry[]> {
    const encodedProject = encodeURIComponent(project);
    return this.http.get<{ list: JournalEntry[] }>(
      `${baseUrl}/${encodedProject}/journals`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.list) // ⬅️ correct property
    );
  }


  // 🟢 Post a journal entry (mark as posted)
  post(project: string, id: number): Observable<void> {
    const encodedProject = encodeURIComponent(project);
    return this.http.post<void>(
      `${baseUrl}/${encodedProject}/journals/${id}/post`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // 🟢 Unpost a journal entry (reverse posting)
  unpost(project: string, id: number): Observable<{ message: string }> {
    const encodedProject = encodeURIComponent(project);
    return this.http.post<{ message: string }>(
      `${baseUrl}/${encodedProject}/journals/${id}/unpost`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // 🟢 Delete a journal entry
  delete(project: string, id: number): Observable<{ message: string }> {
    const encodedProject = encodeURIComponent(project);
    return this.http.delete<{ message: string }>(
      `${baseUrl}/${encodedProject}/journals/${id}`,
      { headers: this.getHeaders() }
    );
  }
}

