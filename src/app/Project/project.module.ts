import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ✅ Material modules
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ListComponent } from './Components/list/list.component';
import { CreateComponent } from './Components/create/create.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslatePipe } from '../Shared/Pipes/translate.pipe';
import { AppRouteModule } from '../app-route.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../Auth/interceptors/auth.interceptor';
import { UpdateComponent } from './Components/update/update.component';
import { DeleteComponent } from './Components/delete/delete.component';
@NgModule({
  imports: [
    ListComponent,
    CreateComponent,
    UpdateComponent,
    DeleteComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppRouteModule,
    // ✅ All material modules go here
    MatDialogModule,
    MatTooltipModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatCardModule,
    MatToolbarModule
    , TranslatePipe
  ],
  exports: [
    ListComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class ProjectModule { }
