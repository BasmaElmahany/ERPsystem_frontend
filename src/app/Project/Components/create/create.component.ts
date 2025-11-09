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

  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateComponent>,
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
      console.log(this.isEditMode ? 'Updating project:' : 'Creating new project:', {
        name: projectData.name,
        description: projectData.description || 'No description'
      });
      this.dialogRef.close(projectData);
    }
  }

  cancel() {
    this.dialogRef.close();
  }}

