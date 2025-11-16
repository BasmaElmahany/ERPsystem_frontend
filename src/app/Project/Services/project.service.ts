import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CreateProjectDto, Project, UpdateProjectDto } from '../Models/project';
import { AuthService } from '../../Auth/Services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private readonly projectsUrl = '/api/Projects';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /** Get all projects */
  getProjects(): Observable<Project[]> {
    return this.http.get<{ success: boolean; data: Project[] }>(
      this.projectsUrl,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data)
    );
  }

  /** Create project */
  createProject(payload: CreateProjectDto): Observable<Project> {
    return this.http.post<{ success: boolean; data: Project }>(
      this.projectsUrl,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data)
    );
  }

  /** Update project */
  updateProject(id: number, payload: UpdateProjectDto): Observable<Project> {
    return this.http.put<{ success: boolean; data: Project }>(
      `${this.projectsUrl}/${id}`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data)
    );
  }

  /** Delete project */
  deleteProject(id: number): Observable<any> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.projectsUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res)
    );
  }
}
