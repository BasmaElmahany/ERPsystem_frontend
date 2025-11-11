import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChartOfAccount } from '../../Models/ChartOfAccount';

@Component({
  selector: 'app-delete',

  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})
export class DeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChartOfAccount
  ) {}

  onCancel(): void {
    this.dialogRef.close(false); // user canceled
  }

  onConfirm(): void {
    this.dialogRef.close(true); // user confirmed
  }
}
