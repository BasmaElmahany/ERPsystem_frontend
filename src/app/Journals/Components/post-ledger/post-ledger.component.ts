import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../Shared/Pipes/translate.pipe';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-post-ledger',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MatDialogModule, MatButtonModule],
  templateUrl: './post-ledger.component.html',
  styleUrl: './post-ledger.component.scss'
})
export class PostLedgerComponent {  constructor(
    private dialogRef: MatDialogRef<PostLedgerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}