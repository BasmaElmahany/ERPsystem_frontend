import { NgModule } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ListComponent } from '../Project/Components/list/list.component';
import { JournalRouteModule } from './journalRoute.module';
import { JournalListComponent } from './Components/journal-list/journal-list.component';
import { CreateJournalComponent } from './Components/create-journal/create-journal.component';
import { DeleteJournalComponent } from './Components/delete-journal/delete-journal.component';
import { EditJournalComponent } from './Components/edit-journal/edit-journal.component';
import { PostLedgerComponent } from './Components/post-ledger/post-ledger.component';
import { UnpostLedgerComponent } from './Components/unpost-ledger/unpost-ledger.component';

import { MatPaginatorModule } from '@angular/material/paginator';
import { JournalLinesComponent } from './Components/journal-lines/journal-lines.component';


@NgModule({
  declarations: [
 JournalListComponent ,
 CreateJournalComponent,
 DeleteJournalComponent,
 EditJournalComponent,
 PostLedgerComponent,
 UnpostLedgerComponent,
 JournalLinesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    JournalRouteModule,
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
    MatPaginatorModule
  ],
  exports: [JournalListComponent]
})
export class JournalModule { }
