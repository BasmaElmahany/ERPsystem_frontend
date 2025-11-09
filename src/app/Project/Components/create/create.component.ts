import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create',
  standalone: false,
 // imports: [],
  templateUrl: './create.component.html',
 styleUrls: ['./create.component.scss']
})
export class CreateComponent {
 @Output() close = new EventEmitter<void>();
 projectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  save() {
    if (this.projectForm.valid) {
      console.log('Project saved', this.projectForm.value);
      this.dialogRef.close('saved'); // ✅ notify parent
    }
  }

  cancel() {
    this.dialogRef.close();
  }}

