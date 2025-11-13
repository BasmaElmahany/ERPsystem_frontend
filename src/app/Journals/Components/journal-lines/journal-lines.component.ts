import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { JournalWithLines } from '../../Models/journal';
import { JournalService } from '../../Services/journal.service';
import { AccountList } from '../../../ChartOfAccounts/Models/ChartOfAccount';
import { ChartOfAccountsService } from '../../../ChartOfAccounts/Services/chart-of-accounts.service';

@Component({
  selector: 'app-journal-lines',
  templateUrl: './journal-lines.component.html',
  styleUrl: './journal-lines.component.scss'
})
export class JournalLinesComponent implements OnInit {

  projectName = '';
  journalId!: number;
  journalData!: JournalWithLines;
  accounts: AccountList[] = [];

  loading = false;
  totalDebit = 0;
  totalCredit = 0;

  constructor(
    private route: ActivatedRoute,
    private service: JournalService,
    private accountService: ChartOfAccountsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.projectName = this.route.snapshot.paramMap.get('project') || '';
    this.journalId = Number(this.route.snapshot.paramMap.get('id'));

    // 🟢 Load accounts first, then journal
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountService.getList(this.projectName).subscribe({
      next: (res) => {
        this.accounts = res;
        this.fetchJournalLines();
      },
      error: () => this.snackBar.open("Failed to load accounts", "Close", { duration: 4000 })
    });
  }

  fetchJournalLines(): void {
    this.loading = true;

    this.service.getById(this.projectName, this.journalId).subscribe({
      next: (res) => {
        this.journalData = res;

        // 🟢 Assign account name to each line
        this.journalData.lines = res.lines.map(line => {
          const acc = this.accounts.find(a => a.id === line.accountId);
          return {
            ...line,
            accountName: acc ? acc.accountName : 'Unknown Account'
          };
        });

        // totals
        this.totalDebit = res.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
        this.totalCredit = res.lines.reduce((sum, l) => sum + (l.credit || 0), 0);
      },
      error: () => {
        this.snackBar.open('Failed to fetch journal lines', 'Close', { duration: 4000 });
      },
      complete: () => (this.loading = false)
    });
  }
}