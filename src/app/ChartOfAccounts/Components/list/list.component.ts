import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { ChartOfAccountsService } from '../../Services/chart-of-accounts.service';
import { ChartOfAccount } from '../../Models/ChartOfAccount';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18nService } from '../../../Shared/Services/i18n.service';
import { CreateComponent } from '../create/create.component';
import { EditComponent } from '../edit/edit.component';
import { DeleteComponent } from '../delete/delete.component';
import { MatPaginator } from '@angular/material/paginator';

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
  selectedAccount?: ChartOfAccount;
  filteredAccounts: ChartOfAccount[] = [];
  paginatedAccounts: ChartOfAccount[] = [];

  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 20, 50];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchTerm = '';

  // Map backend account type values to translation keys
  private accountTypeKeyMap: { [key: string]: string } = {
    'asset': 'ASSET',
    'contra asset': 'CONTRA_ASSET',
    'current asset': 'CURRENT_ASSET',
    'liability': 'LIABILITY',
    'contra liability': 'CONTRA_LIABILITY',
    'current liability': 'CURRENT_LIABILITY',
    'equity': 'EQUITY',
    'revenue': 'REVENUE',
    'expense': 'EXPENSE'
  };

  translateAccountType(type?: string): string {
    if (!type) return '';
    const key = this.accountTypeKeyMap[type.trim().toLowerCase()] || type;
    return this.i18n.instant(key);
  }

  constructor(private service: ChartOfAccountsService, private route: ActivatedRoute, private dialog: MatDialog,
    private snackBar: MatSnackBar, private router: Router, private i18n: I18nService) { }

  ngOnInit(): void {
    // 🟢 Read project name from route parameter
    this.projectName = this.route.snapshot.paramMap.get('project') || '';
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.service.getAll(this.projectName).subscribe({
      next: (res) => {
        this.accounts = res;
        this.filteredAccounts = [...res];
        this.updatePagination();
      },
      error: (err) => console.error(err),
      complete: () => (this.loading = false)
    });
  }
  applySearch() {
  const term = this.searchTerm.toLowerCase();

  this.filteredAccounts = this.accounts.filter(acc =>
    acc.accountName.toLowerCase().includes(term) ||
    acc.accountCode.toString().includes(term) ||
    acc.accountType.toLowerCase().includes(term)
  );

  this.pageIndex = 0;
  this.updatePagination();
}
updatePagination(): void {
  const start = this.pageIndex * this.pageSize;
  const end = start + this.pageSize;
  this.paginatedAccounts = this.filteredAccounts.slice(start, end);
}

onPageChange(event: any): void {
  this.pageIndex = event.pageIndex;
  this.pageSize = event.pageSize;
  this.updatePagination();
}

sortData(key: keyof ChartOfAccount): void {
  if (this.sortKey === key) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortKey = key;
    this.sortDirection = 'asc';
  }

  this.filteredAccounts.sort((a: any, b: any) => {
    const valA = a[key] ?? '';
    const valB = b[key] ?? '';
    if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  this.updatePagination();
}


  openCreateModal() {
    const dialogRef = this.dialog.open(CreateComponent, {
      width: '500px',
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: { projectName: this.projectName } // ✅ Pass project name here
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Attempting to create account:', result);
        this.service.create(this.projectName, result).subscribe({
            next: (createdAccount) => {
            console.log('تم إضافة الحساب بنجاح:', createdAccount);
            this.snackBar.open(this.i18n.instant('ACCOUNT_ADDED_SUCCESS'), this.i18n.instant('CLOSE'), { duration: 4000 });
            this.loadAccounts();
          },
          error: (error) => {
            console.error('Error creating Account:', error);
            const status = error?.status;
            const serverMessage = error?.error?.message || error?.message || 'Unknown error';
            this.snackBar.open(this.i18n.instant('ACCOUNT_CREATE_FAIL', { status: status || '', msg: serverMessage }), this.i18n.instant('CLOSE'), { duration: 6000 });
          }
        });
      }
    });
  }
  openEditModal(account: ChartOfAccount) {
    this.loading = true;

    // Load DTO (chart + account)
    this.service.getFullById(this.projectName, account.id).subscribe({
      next: (dto) => {
        const dialogRef = this.dialog.open(EditComponent, {
          width: '500px',
          disableClose: true,
          panelClass: 'custom-dialog-container',
          data: {
            projectName: this.projectName,
            id: account.id,
            dto: dto
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (!result) return;

          this.service.update(this.projectName, account.id, result).subscribe({
            next: () => {
              this.snackBar.open(this.i18n.instant('ACCOUNT_UPDATE_SUCCESS'), this.i18n.instant('CLOSE'), { duration: 4000 });
              this.loadAccounts();
            },
            error: (err) => {
              this.snackBar.open(this.i18n.instant('ACCOUNT_UPDATE_FAIL'), this.i18n.instant('CLOSE'), { duration: 6000 });
              console.error(err);
            }
          });
        });
      },
      error: (err) => console.error('Failed to load DTO', err),
      complete: () => (this.loading = false)
    });
  }


  openDeleteModal(account: ChartOfAccount): void {
    this.selectedAccount = { ...account };
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '400px',
      disableClose: true,
      data: { projectName: this.projectName, account: this.selectedAccount },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        if (!this.selectedAccount) {
          console.error('No account selected for update.');
          return;
        }
        this.service.delete(this.projectName, this.selectedAccount.id).subscribe({
            next: () => {
            this.snackBar.open(this.i18n.instant('ACCOUNT_DELETE_SUCCESS', { name: this.selectedAccount?.accountName }), this.i18n.instant('CLOSE'), { duration: 4000 });
            this.loadAccounts();
          },
          error: (err) => {
            console.error('Failed to delete Account', err);
            this.snackBar.open(this.i18n.instant('ACCOUNT_DELETE_FAIL', { msg: err?.statusText || '' }), this.i18n.instant('CLOSE'), { duration: 6000 });
          }
        });
      }
    });
  }


}
