import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JournalService } from '../../Services/journal.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JournalEntry } from '../../Models/journal';
import { CreateJournalComponent } from '../create-journal/create-journal.component';
import { EditJournalComponent } from '../edit-journal/edit-journal.component';
import { DeleteJournalComponent } from '../delete-journal/delete-journal.component';
import { PostLedgerComponent } from '../post-ledger/post-ledger.component';
import { UnpostLedgerComponent } from '../unpost-ledger/unpost-ledger.component';

@Component({
  selector: 'app-journal-list',
  templateUrl: './journal-list.component.html',
  styleUrls: ['./journal-list.component.scss']
})
export class JournalListComponent implements OnInit {
  projectName = '';
  journals: JournalEntry[] = [];
  filteredJournals: JournalEntry[] = []; // ✅ filtered results
  searchTerm = ''; // ✅ search box model
  loading = false;
  sortKey: keyof JournalEntry | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private route: ActivatedRoute,
    private service: JournalService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.projectName = this.route.snapshot.paramMap.get('project') || '';
    this.loadJournals();
  }

  loadJournals(): void {
    this.loading = true;
    this.service.getAll(this.projectName).subscribe({
      next: (res) => {
        this.journals = res;
        this.filteredJournals = [...res]; // initialize filtered list
      },
      error: (err) => console.error(err),
      complete: () => (this.loading = false)
    });
  }

  // ✅ Simple client-side search
  applySearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredJournals = this.journals.filter(j =>
      j.entryNumber?.toLowerCase().includes(term) ||
      j.description?.toLowerCase().includes(term) ||
      j.date?.toString().includes(term)
    );
  }

  sortData(key: keyof JournalEntry): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }

    this.filteredJournals.sort((a: any, b: any) => {
      const valA = a[key] ?? '';
      const valB = b[key] ?? '';
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

 openCreateModal() {
  const dialogRef = this.dialog.open(CreateJournalComponent, {
    width: '700px',
    disableClose: true,
    data: { projectName: this.projectName }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.service.create(this.projectName, result).subscribe({
        next: () => {
          this.snackBar.open('Journal created successfully', 'Close', { duration: 4000 });
          this.loadJournals();
        },
        error: err => this.snackBar.open('Failed to create Journal', 'Close', { duration: 4000 })
      });
    }
  });
}

openEditModal(journal: any) {
  const dialogRef = this.dialog.open(EditJournalComponent, {
    width: '700px',
    disableClose: true,
    data: { projectName: this.projectName, journal }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.service.update(this.projectName, journal.id, result).subscribe({
        next: () => {
          this.snackBar.open('Journal updated successfully', 'Close', { duration: 4000 });
          this.loadJournals();
        },
        error: err => this.snackBar.open('Failed to update Journal', 'Close', { duration: 4000 })
      });
    }
  });
}

openDeleteModal(journal: any) {
  const dialogRef = this.dialog.open(DeleteJournalComponent, {
    width: '400px',
    disableClose: true,
    data: { projectName: this.projectName, journal }
  });

  dialogRef.afterClosed().subscribe(confirm => {
    if (confirm) {
      this.service.delete(this.projectName, journal.id).subscribe({
        next: () => {
          this.snackBar.open('Journal deleted successfully', 'Close', { duration: 4000 });
          this.loadJournals();
        },
        error: err => this.snackBar.open('Failed to delete Journal', 'Close', { duration: 4000 })
      });
    }
  });
}

openPostModal(journal: any) {
  const dialogRef = this.dialog.open(PostLedgerComponent, {
    width: '400px',
    disableClose: true,
    data: { journal }
  });

  dialogRef.afterClosed().subscribe(confirm => {
    if (confirm) {
      this.service.post(this.projectName, journal.id).subscribe({
        next: () => {
          this.snackBar.open('Journal posted successfully', 'Close', { duration: 4000 });
          this.loadJournals();
        },
        error: err => this.snackBar.open('Failed to post Journal', 'Close', { duration: 4000 })
      });
    }
  });
}

openUnpostModal(journal: any) {
  const dialogRef = this.dialog.open(UnpostLedgerComponent, {
    width: '400px',
    disableClose: true,
    data: { journal }
  });

  dialogRef.afterClosed().subscribe(confirm => {
    if (confirm) {
      this.service.unpost(this.projectName, journal.id).subscribe({
        next: () => {
          this.snackBar.open('Journal unposted successfully', 'Close', { duration: 4000 });
          this.loadJournals();
        },
        error: err => this.snackBar.open('Failed to unpost Journal', 'Close', { duration: 4000 })
      });
    }
  });
}

}