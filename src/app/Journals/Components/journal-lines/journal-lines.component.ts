import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { JournalWithLines } from '../../Models/journal';
import { JournalService } from '../../Services/journal.service';

@Component({
  selector: 'app-journal-lines',
  templateUrl: './journal-lines.component.html',
  styleUrl: './journal-lines.component.scss'
})
export class JournalLinesComponent implements OnInit {
  projectName = '';
  journalId!: number;
  journalData!: JournalWithLines;
  loading = false;
 totalDebit = 0;
totalCredit = 0;
  constructor(
    private route: ActivatedRoute,
    private service: JournalService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.projectName = this.route.snapshot.paramMap.get('project') || '';
    this.journalId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchJournalLines();
  }



fetchJournalLines(): void {
  this.loading = true;
  this.service.getById(this.projectName, this.journalId).subscribe({
    next: (res) => {
      this.journalData = res;

      // ✅ احسب الإجماليات هنا
      this.totalDebit = res.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
      this.totalCredit = res.lines.reduce((sum, l) => sum + (l.credit || 0), 0);
    },
    error: (err) => {
      console.error(err);
      this.snackBar.open('Failed to fetch journal lines', 'Close', { duration: 4000 });
    },
    complete: () => (this.loading = false)
  });
}

}