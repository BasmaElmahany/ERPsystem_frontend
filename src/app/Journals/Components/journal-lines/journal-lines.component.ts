import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18nService } from '../../../Shared/Services/i18n.service';
import { ActivatedRoute } from '@angular/router';
import { JournalWithLines } from '../../Models/journal';
import { JournalService } from '../../Services/journal.service';
import { AccountList } from '../../../ChartOfAccounts/Models/ChartOfAccount';
import { ChartOfAccountsService } from '../../../ChartOfAccounts/Services/chart-of-accounts.service';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
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
    private snackBar: MatSnackBar,
    private i18n: I18nService
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
      error: () => this.snackBar.open(this.i18n.instant('FAILED_LOAD_ACCOUNTS'), this.i18n.instant('CLOSE'), { duration: 4000 })
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
        this.snackBar.open(this.i18n.instant('FAILED_FETCH_JOURNAL_LINES'), this.i18n.instant('CLOSE'), { duration: 4000 });
      },
      complete: () => (this.loading = false)
    });
  }
  exportToExcel(): void {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('تفاصيل القيد ', {
    views: [{ rightToLeft: true }]  // For Arabic layout
  });

  // ========== JOURNAL HEADER ==========
  sheet.mergeCells('A1:E1');
  const title = sheet.getCell('A1');
  title.value = `Journal #${this.journalData.entry.entryNumber}`;
  title.font = { size: 16, bold: true };
  title.alignment = { horizontal: 'center' };

  sheet.addRow([]);

  sheet.addRow(['التفاصيل:', this.journalData.entry.description]);
  sheet.addRow(['التاريخ:', new Date(this.journalData.entry.date).toLocaleDateString('ar-EG')]);
  sheet.addRow(['دفتر الاستاذ:', this.journalData.entry.posted ? 'تم ترحيله لدفتر الاستاذ' : 'لم يتم ترحيله لدفتر الاستاذ']);
  sheet.addRow([]);

  // ========== TABLE HEADER ==========
  const headerRow = sheet.addRow([
    '#',
    'الحساب',
    'تفاصيل',
    'دائن',
    'مدين'
  ]);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E0E0E0' }
    };
    cell.alignment = { horizontal: 'center' };
  });

  // ========== JOURNAL LINES ==========
  this.journalData.lines.forEach((line, index) => {
    const row = sheet.addRow([
      index + 1,
      line.accountName,
      line.description,
      line.debit,
      line.credit
    ]);

    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // ========== TOTALS ROW ==========
  const totalsRow = sheet.addRow([
    '',
    '',
    'المجموع',
    this.totalDebit,
    this.totalCredit
  ]);

  totalsRow.font = { bold: true };
  totalsRow.eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'C8E6C9' }
    };
  });

  // Auto width
  sheet.columns.forEach(col => {
    col.width = 20;
  });

  // ========== EXPORT FILE ==========
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, `القيد رقم_${this.journalData.entry.entryNumber}_${new Date().toISOString().split('T')[0]}.xlsx`);
  });
}
}