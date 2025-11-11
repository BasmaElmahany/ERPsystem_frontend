import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-journal',

  templateUrl: './delete-journal.component.html',
  styleUrl: './delete-journal.component.scss'
})
export class DeleteJournalComponent {
  constructor(
    private dialogRef: MatDialogRef<DeleteJournalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}