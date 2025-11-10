import { Component, OnInit } from '@angular/core';
import { ChartOfAccountsService } from '../../Services/chart-of-accounts.service';
import { ChartOfAccount } from '../../Models/ChartOfAccount';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list',

  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit { 
  projectName = '';
  accounts: ChartOfAccount[] = [];
  loading = false;
  sortKey: keyof ChartOfAccount | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private service: ChartOfAccountsService,   private route: ActivatedRoute) {}

   ngOnInit(): void {
    // 🟢 Read project name from route parameter
    this.projectName = this.route.snapshot.paramMap.get('project') || '';
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.service.getAll(this.projectName).subscribe({
      next: (res) => (this.accounts = res),
      error: (err) => console.error(err),
      complete: () => (this.loading = false)
    });
  }

  sortData(key: keyof ChartOfAccount): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }

    this.accounts.sort((a: any, b: any) => {
      const valA = a[key] ?? '';
      const valB = b[key] ?? '';
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
