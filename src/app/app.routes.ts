import { Routes } from '@angular/router';
import { HomeComponent } from './Home/Components/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent, // ✅ layout ثابت
    children: [
      { path: '', redirectTo: 'projects', pathMatch: 'full' },

      {
        path: 'projects',
        loadChildren: () =>
          import('./Project/project.module').then(m => m.ProjectModule)
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

