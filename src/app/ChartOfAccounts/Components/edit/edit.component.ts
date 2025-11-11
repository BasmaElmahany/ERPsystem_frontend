import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountList, ChartOfAccount } from '../../Models/ChartOfAccount';
import { CreateComponent } from '../create/create.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChartOfAccountsService } from '../../Services/chart-of-accounts.service';

@Component({
  selector: 'app-edit',

  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  AccountForm: FormGroup;
  isEditMode = true; // Always true for edit
  parentAccounts: AccountList[] = [];
  projectName = '';
  account: ChartOfAccount;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectName: string; account: ChartOfAccount },
    private service: ChartOfAccountsService
  ) {
    this.projectName = data.projectName;
    this.account = data.account;

    // ✅ Initialize the form with the existing account data
    this.AccountForm = this.fb.group({
      accountCode: [this.account.accountCode, Validators.required],
      accountName: [this.account.accountName, Validators.required],
      accountType: [this.account.accountType, Validators.required],
      parentAccountId: [this.account.parentAccountId || 0],
      isDetail: [this.account.isDetail, Validators.required]
    });
  }

  ngOnInit(): void {
    console.log(`Editing account for project: ${this.projectName}`);
    this.loadParentAccounts();
  }

  loadParentAccounts(): void {
    this.service.getList(this.projectName).subscribe({
      next: (res) => (this.parentAccounts = res),
      error: (err) => console.error('Error loading parent accounts:', err)
    });
  }

  save(): void {
    if (this.AccountForm.valid) {
      const updatedData = this.AccountForm.value;
      console.log('Updated Account:', updatedData);
      this.dialogRef.close(updatedData);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}