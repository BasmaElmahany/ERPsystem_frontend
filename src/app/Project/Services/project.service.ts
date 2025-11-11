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

  constructor(private http: HttpClient, private authService: AuthService) { }


  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
 

 /** Get all projects (requires token) */
getProjects(): Observable<Project[]> {
  return this.http.get<Project[]>(this.projectsUrl, { headers: this.getAuthHeaders() });
}

createProject(payload: CreateProjectDto): Observable<Project> {
  return this.http.post<Project>(this.projectsUrl, payload, { headers: this.getAuthHeaders() });
}

/** Update project (Admin only) */
updateProject(id: number, payload: UpdateProjectDto): Observable<Project> {
  return this.http.put<Project>(`${this.projectsUrl}/${id}`, payload, { headers: this.getAuthHeaders() });
}


/** Delete project (Admin only) */
DeleteProject(id: number): Observable<any> {
  const url = `${this.projectsUrl}/${id}`;
  return this.http.delete(url, { headers: this.getAuthHeaders() });
}

}
