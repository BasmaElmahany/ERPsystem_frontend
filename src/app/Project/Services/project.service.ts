import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CreateProjectDto, Project, UpdateProjectDto } from '../Models/project';
import { AuthService } from '../../Auth/Services/auth.service';
import { baseUrl } from '../../env';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {


private url = `${baseUrl}/projects`;
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /** Attach JWT token to headers */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // --------------------------------------------------------------------
  // 📌 GET ALL PROJECTS
  // --------------------------------------------------------------------
  getProjects(): Observable<Project[]> {
    return this.http.get(this.url, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).pipe(
      map(txt => JSON.parse(txt).data)
    );
  }


  // --------------------------------------------------------------------
  // 📌 CREATE PROJECT
  // --------------------------------------------------------------------
  createProject(payload: CreateProjectDto): Observable<Project> {
    return this.http.post<ApiResponse<Project>>(
      this.url,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data)
    );
  }

  // --------------------------------------------------------------------
  // 📌 UPDATE PROJECT
  // --------------------------------------------------------------------
  updateProject(id: number, payload: UpdateProjectDto): Observable<Project> {
    return this.http.put<ApiResponse<Project>>(
      `${this.url}/${id}`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data)
    );
  }

  // --------------------------------------------------------------------
  // 📌 DELETE PROJECT
  // --------------------------------------------------------------------
  deleteProject(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<ApiResponse<null>>(
      `${this.url}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => ({
        success: res.success,
        message: res.message ?? 'Deleted successfully'
      }))
    );
  }
}
