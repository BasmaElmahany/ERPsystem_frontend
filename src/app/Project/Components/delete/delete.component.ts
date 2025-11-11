// delete.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Project } from '../../Models/project';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss']
})
export class DeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Project
  ) {}

  onCancel(): void {
    this.dialogRef.close(false); // user canceled
  }

  onConfirm(): void {
    this.dialogRef.close(true); // user confirmed
  }
}
