import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateComponent } from '../create/create.component';
import { ProjectService } from '../../Services/project.service';
import { Project } from '../../Models/project';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'] 
})
export class ListComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  projects: Project[] = [];
  isLoading = false;
  selectedProject: Project | null = null;

  constructor(private dialog: MatDialog, private projectService: ProjectService){}

  ngOnInit(): void {
    this.loadProjects();
  }

  openCreateModal() {
    const dialogRef = this.dialog.open(CreateComponent, {
      width: '500px',
      disableClose: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Attempting to create project:', result);
        // Create the project using the service
        this.projectService.createProject(result).subscribe({
          next: (createdProject) => {
            // Clear, localized success message plus project data for debugging
            console.log('تم إضافة المشروع بنجاح:', {
              id: createdProject.id,
              name: createdProject.name,
              description: createdProject.description,
              createdAt: createdProject.createdAt
            });
            this.loadProjects(); // Refresh the list
          },
          error: (error) => {
            console.error('Error creating project:', {
              status: error.status,
              statusText: error.statusText,
              message: error.message,
              error: error.error
            });
          }
        });
      }
    });
  }

  loadProjects(): void {
    console.log("load");
    this.isLoading = true;
    this.projectService.getProjects().subscribe({
      next: (res) => {
        this.projects = res || [];
        console.log('Projects loaded:', {
          totalProjects: this.projects.length,
          projects: this.projects.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description || 'No description',
            createdAt: p.createdAt
          }))
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load projects:', {
          error: err.message,
          status: err.status,
          statusText: err.statusText
        });
        this.isLoading = false;
      }
    });
  }

  joinProject(project: Project): void {
    // call backend to join project
    this.projectService.joinProject(project.id).subscribe({
      next: (res) => {
        console.log(`Joined project ${project.id}`, res);
        // Optionally update UI or navigate
      },
      error: (err) => {
        console.error('Failed to join project', err);
      }
    });
  }

  openEditModal(project: Project) {
    this.selectedProject = { ...project };
    const dialogRef = this.dialog.open(CreateComponent, {
      width: '500px',
      disableClose: true,
      data: this.selectedProject,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.selectedProject) {
        console.log('Attempting to update project:', {
          id: this.selectedProject.id,
          updates: result
        });
        
        this.projectService.updateProject(this.selectedProject.id, result).subscribe({
          next: (updatedProject) => {
            console.log('Project updated successfully:', {
              id: updatedProject.id,
              name: updatedProject.name,
              description: updatedProject.description,
              createdAt: updatedProject.createdAt
            });
            this.loadProjects(); // Refresh the list
          },
          error: (error) => {
            console.error('Error updating project:', {
              status: error.status,
              statusText: error.statusText,
              message: error.message,
              error: error.error
            });
          }
        });
      }
      this.selectedProject = null;
    });
  }

  closeCreateModal() {
    const modal = document.getElementById('createModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
}
