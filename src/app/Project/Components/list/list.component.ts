import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateComponent } from '../create/create.component';
import { ProjectService } from '../../Services/project.service';
import { Project } from '../../Models/project';
import { Router } from '@angular/router';
import { UpdateComponent } from '../update/update.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'] 
})
export class ListComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  projects: Project[] = [];
  sortedProjects: Project[] = [];
  isLoading = false;
  selectedProject: Project | null = null;
  sortKey: 'id' | 'name' | 'description' | 'createdAt' = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private dialog: MatDialog, private projectService: ProjectService, private snackBar: MatSnackBar,private router: Router){}

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
            // Log full error for debugging
            console.error('Error creating project (full):', error);

            const status = error?.status;
            const serverMessage = error?.error?.message || error?.message || 'Unknown error';

            // User-friendly snackbar
            this.snackBar.open(`Failed to create project: ${status || ''} ${serverMessage}`, 'Close', { duration: 6000 });
          }
        });
      }
    });
  }

  sortData(key: 'id' | 'name' | 'description' | 'createdAt'): void {
    if (this.sortKey === key) {
      // If clicking the same column, toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // If clicking a new column, set it as the sort key and default to ascending
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.updateSortedProjects();
  }

  updateSortedProjects(): void {
    this.sortedProjects = [...this.projects].sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortKey) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'description':
          comparison = (a.description || '').localeCompare(b.description || '');
          break;
        case 'createdAt':
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  loadProjects(): void {
    console.log("load");
    this.isLoading = true;
    this.projectService.getProjects().subscribe({
      next: (res) => {
        this.projects = res || [];
        this.updateSortedProjects(); // Update sorted projects whenever data is loaded
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
  const dialogRef = this.dialog.open(UpdateComponent, {
    width: '500px',
    disableClose: true,
    data: this.selectedProject,
    panelClass: 'custom-dialog-container'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result && this.selectedProject) {
      this.projectService.updateProject(this.selectedProject.id, result).subscribe({
        next: (updatedProject) => {
          this.loadProjects();
          this.snackBar.open('Project updated successfully', 'Close', { duration: 4000 });
        },
        error: (error) => {
          console.error('Error updating project:', error);
          this.snackBar.open(`Failed to update project: ${error?.statusText}`, 'Close', { duration: 6000 });
        }
      });
    }
  });
}

  closeCreateModal() {
    const modal = document.getElementById('createModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  openAccounts(project: any): void {
  // Navigate to /accounts/{project.name}
  this.router.navigate(['/accounts', project.name]);
}
}
