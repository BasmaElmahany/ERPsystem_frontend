import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-unpost-ledger',
  templateUrl: './unpost-ledger.component.html',
  styleUrl: './unpost-ledger.component.scss'
})
export class UnpostLedgerComponent {
  constructor(
    private dialogRef: MatDialogRef<UnpostLedgerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
