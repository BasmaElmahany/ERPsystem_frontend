import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChartOfAccountsService } from '../../Services/chart-of-accounts.service';
import { AccountList } from '../../Models/ChartOfAccount';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  AccountForm: FormGroup;
  isEditMode = false;
  parentAccounts: AccountList[] = [];
  projectName = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: ChartOfAccountsService
  ) {
    this.isEditMode = !!data?.accountCode; // check if edit mode based on data presence
    this.projectName = data?.projectName || ''; // ✅ get project name from dialog data
    this.AccountForm = this.fb.group({
      accountCode: ['', Validators.required],
      accountName: ['', Validators.required],
      accountType: ['', Validators.required],
      parentAccountId: [0],
      isDetail: [true, Validators.required],

      // NEW FIELDS
      currency: ['EGP', Validators.required],
      openingBalance: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    console.log(`Loaded project: ${this.projectName}`);
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
      const AccountData = this.AccountForm.value;
      console.log(this.isEditMode ? 'Updating Account:' : 'Creating Account:', AccountData);
      this.dialogRef.close(AccountData);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
