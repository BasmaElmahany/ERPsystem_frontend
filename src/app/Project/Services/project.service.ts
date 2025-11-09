import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CreateProjectDto, Project, UpdateProjectDto } from '../Models/project';
import { AuthService } from '../../Auth/Services/auth.service';



@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  // Backend endpoint for projects (using proxy)
  private readonly projectsUrl = '/api/Projects';
  private readonly jsonHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient, private authService: AuthService) { }


  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
  /** Ensure Admin before performing restricted actions */
  private ensureAdmin(): boolean {
    if (!this.authService.isAdmin()) {
      console.warn('Access denied: Admin privileges required.');
      return false;
    }
    return true;
  }

 /** Get all projects (requires token) */
getProjects(): Observable<Project[]> {
  return this.http.get<Project[]>(this.projectsUrl, { headers: this.getAuthHeaders() });
}

/** Create project (Admin only) */
createProject(payload: CreateProjectDto): Observable<Project> {
  if (!this.ensureAdmin()) {
    return throwError(() => new Error('Unauthorized: Admin privileges required.'));
  }
  return this.http.post<Project>(this.projectsUrl, payload, { headers: this.getAuthHeaders() });
}

/** Update project (Admin only) */
updateProject(id: number, payload: UpdateProjectDto): Observable<Project> {
  if (!this.ensureAdmin()) {
    return throwError(() => new Error('Unauthorized: Admin privileges required.'));
  }
  return this.http.put<Project>(`${this.projectsUrl}/${id}`, payload, { headers: this.getAuthHeaders() });
}

/** Join project (logged-in users) */
joinProject(id: number): Observable<any> {
  const url = `${this.projectsUrl}/${id}/join`;
  return this.http.post(url, {}, { headers: this.getAuthHeaders() });
}

}
