import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../Shared/Pipes/translate.pipe';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-delete-journal',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MatDialogModule, MatButtonModule],
  templateUrl: './delete-journal.component.html',
  styleUrl: './delete-journal.component.scss'
})
export class DeleteJournalComponent {constructor(
    private dialogRef: MatDialogRef<DeleteJournalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true); // return true to parent
  }

  onCancel(): void {
    this.dialogRef.close(false); // cancel action
  }
}