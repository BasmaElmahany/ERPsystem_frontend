import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JournalListComponent } from './Components/journal-list/journal-list.component';



const routes: Routes = [
  { path: '', component: JournalListComponent },       // ✅ /journals
  { path: 'journallist', component: JournalListComponent },   // ✅ /journals/list
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JournalRouteModule { }
