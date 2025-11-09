import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateComponent } from '../create/create.component';
@Component({
  selector: 'app-list',
 // standalone: true,
 // imports: [],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'] 
})
export class ListComponent {
 @Output() close = new EventEmitter<void>();
constructor(private dialog: MatDialog){}

   openCreateModal() {
    const dialogRef = this.dialog.open(CreateComponent, {
      width: '500px',
      disableClose: true,
      panelClass: 'custom-dialog-container'
    });

    // Optional: handle after close
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') {
        console.log('Project created successfully!');
        // refresh list or call API here
      }
    });
  }

 closeCreateModal() {
    const modal = document.getElementById('createModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
}
