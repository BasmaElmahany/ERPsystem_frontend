import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./Auth/Components/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./Auth/Components/register/register.component').then(m => m.RegisterComponent) },
  { path: '', redirectTo: 'login', pathMatch: 'full' } // optional default
];
