import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LedgerListComponent } from './Components/ledger-list/ledger-list.component';



const routes: Routes = [
  { path: '', component: LedgerListComponent },     
  { path: 'Ledger', component: LedgerListComponent }, 

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LedgerRoutingModule { }
