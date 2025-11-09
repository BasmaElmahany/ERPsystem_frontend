import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  // Backend endpoint for projects (using proxy)
  private readonly projectsUrl = '/api/Projects';
  private readonly jsonHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  /** Create a new project */
  createProject(payload: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(this.projectsUrl, payload, { headers: this.jsonHeaders });
  }

  /** Get all projects */
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.projectsUrl);
  }

  /** Get single project by id */
  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.projectsUrl}/${id}`);
  }

  /** Update a project */
  updateProject(id: number, payload: UpdateProjectDto): Observable<Project> {
    return this.http.put<Project>(
      `${this.projectsUrl}/${id}`,
      payload,
      { headers: this.jsonHeaders }
    );
  }

  /**
   * Join a project. Assumes backend exposes a POST /api/Projects/{id}/join endpoint.
   * If your API uses a different path/payload, update accordingly.
   */
  joinProject(id: number): Observable<any> {
    const url = `${this.projectsUrl}/${id}/join`;
    return this.http.post(url, {}, { headers: this.jsonHeaders });
  }
}
