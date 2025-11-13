import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../Shared/Pipes/translate.pipe';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslatePipe
     ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
   loginForm!: FormGroup;
  loading = false;
  message: string | null = null;
  isSuccess: boolean = false;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.loginForm.valueChanges.subscribe(() => {
    this.message = null;
  });
  }

 onSubmit(): void {
  if (this.loginForm.invalid) return;

  this.loading = true;
  this.auth.login(this.loginForm.value).subscribe({
    next: (res) => {
      this.auth.storeToken(res.token);
      const user = this.auth.getUserInfo();

      const userName = user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User';
      this.toastr.success(`Welcome ${userName}`);

      /*const role = user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || user?.['role'];

      if (role === 'Admin') {
        this.router.navigate(['/dashboard']);
      } else if (role === 'Member') {
        this.router.navigate(['/home']);
      } else {
        this.router.navigate(['/unauthorized']);
      }*/
     console.log(res);
     console.log(user);
    },
  error: (err) => {
  this.loading = false;

  
  if (err.error?.message) {
    this.message = err.error.message;
  } else if (typeof err.error === 'string') {
    this.message = err.error; 
  } else {
    this.message = 'Login failed. Please try again.';
  }

  this.isSuccess = false;
}
  });
}
  // Helper to easily access form controls
  get f() {
    return this.loginForm.controls;
  }
}
