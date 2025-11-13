import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../Shared/Pipes/translate.pipe';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-unpost-ledger',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MatDialogModule, MatButtonModule],
  templateUrl: './unpost-ledger.component.html',
  styleUrl: './unpost-ledger.component.scss'
})
export class UnpostLedgerComponent {
  constructor(
    private dialogRef: MatDialogRef<UnpostLedgerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
