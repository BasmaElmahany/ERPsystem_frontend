import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ToastrModule
  ],
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  message: string | null = null;
  isSuccess: boolean = false;
  loading: boolean = false;
  
  get f() {
    return this.registerForm.controls;
  }
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue],
      projectId: [0, Validators.required]
    }, { validators: this.passwordMatchValidator });
  }
  

  onSubmit() {
  if (this.registerForm.invalid) return;

  const { fullName, email, password, projectId } = this.registerForm.value;
  this.loading = true;
  
    this.auth.register({ fullName, email, password, projectId }).subscribe({
      next: (res: { message: string }) => {
        this.loading = false;
        this.message = 'Registration successful! Check your email.';
        this.isSuccess = true;
        this.toastr.success(this.message);
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: any) => {
  console.error('Registration error:', err);

  let errorMessage = 'Registration failed. Please try again.';

  if (typeof err.error === 'string') {
    errorMessage = err.error;
  } else if (err.error?.message) {
    errorMessage = err.error.message;
  }

  this.loading = false;
  this.message = errorMessage;
  this.isSuccess = false;
  this.toastr.error(this.message);
      }
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const pw = group.get('password')?.value;
    const cpw = group.get('confirmPassword')?.value;
    return pw === cpw ? null : { passwordMismatch: true };
  }
  
  

}