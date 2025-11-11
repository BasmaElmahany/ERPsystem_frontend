import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-post-ledger',
  templateUrl: './post-ledger.component.html',
  styleUrl: './post-ledger.component.scss'
})
export class PostLedgerComponent {
  constructor(
    private dialogRef: MatDialogRef<PostLedgerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}