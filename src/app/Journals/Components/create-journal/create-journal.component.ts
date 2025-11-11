import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JournalService } from '../../Services/journal.service';

@Component({
  selector: 'app-create-journal',

  templateUrl: './create-journal.component.html',
  styleUrl: './create-journal.component.scss'
})
export class CreateJournalComponent {
  JournalForm: FormGroup;
  projectName = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateJournalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: JournalService
  ) {
    this.projectName = data.projectName;

    this.JournalForm = this.fb.group({
      entryNumber: ['', Validators.required],
      date: ['', Validators.required],
      description: ['', Validators.required],
      lines: this.fb.array([
        this.createLine()
      ])
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

  addLine() {
    this.lines.push(this.createLine());
  }

  removeLine(index: number) {
    this.lines.removeAt(index);
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