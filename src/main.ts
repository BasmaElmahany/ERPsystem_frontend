import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app/app.routes';
import { ProjectModule } from './app/Project/project.module';
import { SharedTranslationsModule } from './app/Shared/shared-translations.module';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),

    importProvidersFrom(
      BrowserAnimationsModule,
      ProjectModule, // ✅ import the module *inside* importProvidersFrom
      SharedTranslationsModule,
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
        closeButton: true,
        progressBar: true
      })
    ),

    provideAnimationsAsync()
  ]
}).catch(err => console.error(err));
