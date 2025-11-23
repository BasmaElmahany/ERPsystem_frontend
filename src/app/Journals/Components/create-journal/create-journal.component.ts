import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JournalService } from '../../Services/journal.service';
import { AccountList } from '../../../ChartOfAccounts/Models/ChartOfAccount';
import { ChartOfAccountsService } from '../../../ChartOfAccounts/Services/chart-of-accounts.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18nService } from '../../../Shared/Services/i18n.service';

@Component({
  selector: 'app-create-journal',

  templateUrl: './create-journal.component.html',
  styleUrl: './create-journal.component.scss'
})
export class CreateJournalComponent implements OnInit {
  JournalForm: FormGroup;
  projectName = '';
  accounts: AccountList[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateJournalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private journalService: JournalService,
    private chartService: ChartOfAccountsService,
      private snackBar: MatSnackBar,
      private i18n: I18nService
  ) {
    this.projectName = data.projectName;

    this.JournalForm = this.fb.group({
      entryNumber: ['', Validators.required],
      date: ['', Validators.required],
      description: ['', Validators.required],
      lines: this.fb.array([this.createLine()])
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.chartService.getList(this.projectName).subscribe({
      next: (res) => (this.accounts = res),
      error: (err) => console.error('Error loading accounts:', err)
    });
  }

  get lines(): FormArray {
    return this.JournalForm.get('lines') as FormArray;
  }

  createLine(): FormGroup {
    return this.fb.group({
      accountId: [null, Validators.required],
      debit: [0, [Validators.required, Validators.min(0)]],
      credit: [0, [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  addLine(): void {
    this.lines.push(this.createLine());
  }

  removeLine(index: number): void {
    this.lines.removeAt(index);
  }

  get totalDebit(): number {
    return this.lines.controls.reduce((sum, c) => sum + (c.get('debit')?.value || 0), 0);
  }

  get totalCredit(): number {
    return this.lines.controls.reduce((sum, c) => sum + (c.get('credit')?.value || 0), 0);
  }

  save(): void {
    if (this.JournalForm.valid) {
      if (this.totalDebit !== this.totalCredit) { // 🟡 Show styled snackbar instead of alert
      this.snackBar.open(
        this.i18n.instant('DEBITS_CREDITS_MUST_EQUAL'),
        this.i18n.instant('CLOSE'),
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar-warning']
        }
      );
      return;
    }

    this.dialogRef.close(this.JournalForm.value);
  } else {
    this.snackBar.open(
      this.i18n.instant('FILL_REQUIRED_FIELDS'),
      this.i18n.instant('CLOSE'),
      {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      }
    );
  }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}