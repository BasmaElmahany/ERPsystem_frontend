import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '../../../Shared/Pipes/translate.pipe';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent {
  @Output() close = new EventEmitter<void>();
  projectForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data;
    this.projectForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      description: [data?.description || '']
    });
  }

  save() {
    if (this.projectForm.valid) {
      const projectData = this.projectForm.value;
      console.log(this.isEditMode ? 'Updating project:' : 'Saving project:', projectData);
      this.dialogRef.close(projectData);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
