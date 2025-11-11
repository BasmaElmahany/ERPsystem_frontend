import { Routes } from '@angular/router';
import { HomeComponent } from './Home/Components/home/home.component';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./Auth/Components/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./Auth/Components/register/register.component').then(m => m.RegisterComponent) },
  { path: '', redirectTo: 'login', pathMatch: 'full' } ,// optional default
  {
    path: '',
    component: HomeComponent, // ✅ layout ثابت
    children: [
      { path: '', redirectTo: 'projects', pathMatch: 'full' },

      {
        path: 'projects',
        loadChildren: () =>
          import('./Project/project.module').then(m => m.ProjectModule)
      }, 
      {
        path: 'accounts/:project',
        loadChildren: () =>
          import('./ChartOfAccounts/chart-of-accounts.module').then(m => m.ChartOfAccountsModule)
      },
      {
        path: 'journals/:project',
        loadChildren: () =>
          import('./Journals/journal.module').then(m => m.JournalModule)
      }
    ]
  },

  // صفحة الدخول (خارج layout)
  {
    path: 'login',
    loadComponent: () =>
      import('./Auth/Components/login/login.component').then(m => m.LoginComponent)
  },

  // fallback
  { path: '**', redirectTo: '' }
];

