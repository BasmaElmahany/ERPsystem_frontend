import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JournalService } from '../../Services/journal.service';


@Component({
  selector: 'app-edit-journal',
  templateUrl: './edit-journal.component.html',
  styleUrl: './edit-journal.component.scss'
})
export class EditJournalComponent  {
  JournalForm: FormGroup;
  projectName = '';
  journalId = 0;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditJournalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const { projectName, journal } = data;
    this.projectName = projectName;
    this.journalId = journal.id;

    this.JournalForm = this.fb.group({
      entryNumber: [journal.entryNumber, Validators.required],
      date: [journal.date, Validators.required],
      description: [journal.description, Validators.required],
      lines: this.fb.array(
        journal.lines.map((l: any) => this.fb.group({
          accountId: [l.accountId],
          debit: [l.debit],
          credit: [l.credit],
          description: [l.description]
        }))
      )
    });
  }

  get lines(): FormArray {
    return this.JournalForm.get('lines') as FormArray;
  }

  save() {
    if (this.JournalForm.valid) {
      this.dialogRef.close(this.JournalForm.value);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}