import { Component, OnInit, Output } from '@angular/core';
import { ChartOfAccountsService } from '../../Services/chart-of-accounts.service';
import { ChartOfAccount } from '../../Models/ChartOfAccount';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateComponent } from '../create/create.component';
import { EditComponent } from '../edit/edit.component';
import { DeleteComponent } from '../delete/delete.component';

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

  constructor(private service: ChartOfAccountsService, private route: ActivatedRoute, private dialog: MatDialog,
    private snackBar: MatSnackBar, private router: Router) { }

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
            this.snackBar.open("Account Added Successfully");
            this.loadAccounts();
          },
          error: (error) => {
            console.error('Error creating Account:', error);
            const status = error?.status;
            const serverMessage = error?.error?.message || error?.message || 'Unknown error';
            this.snackBar.open(`Failed to create Account: ${status || ''} ${serverMessage}`, 'Close', { duration: 6000 });
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
            this.snackBar.open("Account updated successfully", "Close");
            this.loadAccounts();
          },
          error: (err) => {
            this.snackBar.open("Failed to update account", "Close");
            console.error(err);
          }
        });
      });
    },
    error: (err) => console.error("Failed to load DTO", err),
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
            this.snackBar.open(`Account "${this.selectedAccount?.accountName}" deleted successfully.`, 'Close', { duration: 4000 });
            this.loadAccounts();
          },
          error: (err) => {
            console.error('Failed to delete Account', err);
            this.snackBar.open(`Failed to delete Account: ${err?.statusText}`, 'Close', { duration: 6000 });
          }
        });
      }
    });
  }


}
