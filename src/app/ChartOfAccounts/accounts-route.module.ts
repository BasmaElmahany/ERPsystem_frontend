import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './Components/list/list.component';


const routes: Routes = [
  { path: '', component: ListComponent },       // ✅ /projects
  { path: 'accountlist', component: ListComponent },   // ✅ /projects/list
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRouteModule { }
