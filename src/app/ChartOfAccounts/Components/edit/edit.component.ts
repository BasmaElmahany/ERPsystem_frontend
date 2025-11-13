import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountList, AccountWithChartDto, ChartOfAccount } from '../../Models/ChartOfAccount';
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
  //account: ChartOfAccount;

  constructor(
  private fb: FormBuilder,  private service: ChartOfAccountsService,
  private dialogRef: MatDialogRef<EditComponent>,
  @Inject(MAT_DIALOG_DATA) public data: { projectName: string; id: number; dto: AccountWithChartDto }
) {
    this.projectName = data.projectName; // ✅ FIXED
  this.AccountForm = this.fb.group({
    accountCode: [data.dto.accountCode, Validators.required],
    accountName: [data.dto.accountName, Validators.required],
    accountType: [data.dto.accountType, Validators.required],
    parentAccountId: [data.dto.parentAccountId || 0],
    isDetail: [data.dto.isDetail],
    currency: [data.dto.currency, Validators.required],
    openingBalance: [data.dto.openingBalance, Validators.required]
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