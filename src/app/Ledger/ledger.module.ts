import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LedgerListComponent } from './Components/ledger-list/ledger-list.component';
import { LedgerRoutingModule } from './ledger-routing.module';
import { MatTabsModule } from '@angular/material/tabs'; // <-- Import MatTabsModule
import { NgApexchartsModule } from 'ng-apexcharts'; // <-- ApexCharts module

@NgModule({
  declarations: [LedgerListComponent],
  imports: [
     CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LedgerRoutingModule,
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
        MatToolbarModule,
        MatPaginatorModule,
        MatTabsModule  ,NgApexchartsModule 
         
       
  ], 
  
   schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  exports : [LedgerListComponent]
})
export class LedgerModule { }
