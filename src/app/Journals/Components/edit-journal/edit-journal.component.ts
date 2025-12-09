import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18nService } from '../../../Shared/Services/i18n.service';
import { AccountList } from '../../../ChartOfAccounts/Models/ChartOfAccount';
import { ChartOfAccountsService } from '../../../ChartOfAccounts/Services/chart-of-accounts.service';
import { APIbaseUrl, baseUrl } from '../../../env';


@Component({
  selector: 'app-edit-journal',
  templateUrl: './edit-journal.component.html',
  styleUrls: ['./edit-journal.component.scss']
})
export class EditJournalComponent implements OnInit {
  JournalForm: FormGroup;
  projectName = '';
  journalId = 0;
  accounts: AccountList[] = [];
  selectedFile: File | null = null;   // 🔥 same as Create

  existingFileUrl: string | null = null; // Optional: show existing file
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditJournalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private accountsService: ChartOfAccountsService,
    private i18n: I18nService
  ) {
    // ✅ Extract the data safely
    const { projectName, journal } = data;
    const entry = journal?.entry || {};
    const lines = journal?.lines || [];

    this.projectName = projectName;
    this.journalId = entry?.id ?? 0;
    this.existingFileUrl = entry?.photoUrl ? APIbaseUrl + entry.photoUrl
      : null;

    // ✅ Initialize the reactive form
    this.JournalForm = this.fb.group({
      entryNumber: [entry?.entryNumber || '', Validators.required],
      date: [entry?.date ? entry.date.split('T')[0] : '', Validators.required],
      description: [entry?.description || '', Validators.required],
      lines: this.fb.array(
        (lines.length ? lines : [{ accountId: null, debit: 0, credit: 0, description: '' }]).map((l: any) =>
          this.fb.group({
            accountId: [l.accountId, Validators.required],
            debit: [l.debit, [Validators.required, Validators.min(0)]],
            credit: [l.credit, [Validators.required, Validators.min(0)]],
            description: [l.description || '']
          })
        )
      )
    });
  }

  ngOnInit(): void {
    // ✅ Load available accounts for dropdown
    this.accountsService.getList(this.projectName).subscribe({
      next: (res) => (this.accounts = res),
      error: (err) => console.error('Error loading accounts list:', err)
    });
  }

  // === Helper Getters ===
  get lines(): FormArray {
    return this.JournalForm.get('lines') as FormArray;
  }

  get totalDebit(): number {
    return this.lines.controls.reduce((sum, c) => sum + (+c.value.debit || 0), 0);
  }

  get totalCredit(): number {
    return this.lines.controls.reduce((sum, c) => sum + (+c.value.credit || 0), 0);
  }

  // === Actions ===
  addLine(): void {
    this.lines.push(
      this.fb.group({
        accountId: [null, Validators.required],
        debit: [0, [Validators.required, Validators.min(0)]],
        credit: [0, [Validators.required, Validators.min(0)]],
        description: ['']
      })
    );
  }

  removeLine(index: number): void {
    if (this.lines.length > 1) {
      this.lines.removeAt(index);
    } else {
      this.snackBar.open(this.i18n.instant('AT_LEAST_ONE_LINE_REQUIRED'), this.i18n.instant('CLOSE'), {
        duration: 3000,
        panelClass: ['snackbar-warning']
      });
    }
  }
  // =============================
  // FILE UPLOAD (PDF + IMAGE)
  // =============================
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const allowed = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

    if (!allowed.includes(file.type)) {
      this.snackBar.open("Only JPG, PNG, or PDF allowed", "Close", {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    this.selectedFile = file;
  }

  // =============================
  // SAVE 
  // =============================
  save() {
    if (this.JournalForm.invalid) {
      this.snackBar.open(this.i18n.instant('FILL_REQUIRED_FIELDS'), this.i18n.instant('CLOSE'), {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (this.totalDebit !== this.totalCredit) {
      this.snackBar.open(
        this.i18n.instant('DEBITS_CREDITS_MUST_EQUAL'),
        this.i18n.instant('CLOSE'),
        { duration: 4000, panelClass: ['snackbar-warning'] }
      );
      return;
    }

    const formData = new FormData();
    const value = this.JournalForm.value;

    formData.append("entryNumber", value.entryNumber);
    formData.append("date", value.date);
    formData.append("description", value.description);

    // Optional file
    if (this.selectedFile) {
      formData.append("photo", this.selectedFile);
    }

    // Convert lines  
    const cleanLines = value.lines.map((l: any) => ({
      accountId: Number(l.accountId),
      debit: Number(l.debit),
      credit: Number(l.credit),
      description: l.description || ""
    }));

    formData.append("LinesJson", JSON.stringify(cleanLines));
    console.log("CLEAN LINES BEFORE JSON:", cleanLines);
    console.log("FORMDATA CHECK:");
    formData.forEach((v, k) => console.log(k, v));
    this.dialogRef.close({ id: this.journalId, formData });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}