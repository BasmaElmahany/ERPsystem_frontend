import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JournalService } from '../../Services/journal.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JournalEntry } from '../../Models/journal';
import { CreateJournalComponent } from '../create-journal/create-journal.component';
import { EditJournalComponent } from '../edit-journal/edit-journal.component';
import { DeleteJournalComponent } from '../delete-journal/delete-journal.component';
import { PostLedgerComponent } from '../post-ledger/post-ledger.component';
import { UnpostLedgerComponent } from '../unpost-ledger/unpost-ledger.component';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-journal-list',
  templateUrl: './journal-list.component.html',
  styleUrls: ['./journal-list.component.scss']
})
export class JournalListComponent implements OnInit {
  projectName = '';
  journals: JournalEntry[] = [];
  filteredJournals: JournalEntry[] = []; // ✅ filtered results
  paginatedJournals: JournalEntry[] = []; // ✅ فقط الصفحة الحالية

  searchTerm = ''; // ✅ search box model
  loading = false;
  sortKey: keyof JournalEntry | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  startDate: string = '';
  endDate: string = '';
   // 🟢 إعدادات المقسم
  pageSize = 5;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 20, 50];
    @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private service: JournalService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
      private router: Router
  ) { }

  ngOnInit(): void {
    this.projectName = this.route.snapshot.paramMap.get('project') || '';
    this.loadJournals();
  }

 
  loadJournals(): void {
    this.loading = true;
    this.service.getAll(this.projectName).subscribe({
      next: (res) => {
        this.journals = res;
        this.filteredJournals = [...res];
        this.updatePagination();
      },
      error: (err) => console.error(err),
      complete: () => (this.loading = false)
    });
  }

  // ✅ البحث + الفلترة
  applySearch(): void {
    const term = this.searchTerm.toLowerCase();
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;

    this.filteredJournals = this.journals.filter(j => {
      const entryDate = new Date(j.date);
      const matchesText =
        j.entryNumber?.toLowerCase().includes(term) ||
        j.description?.toLowerCase().includes(term) ||
        j.date?.toString().includes(term);
      const matchesDate =
        (!start || entryDate >= start) && (!end || entryDate <= end);
      return matchesText && matchesDate;
    });

    this.pageIndex = 0; // reset to first page
    this.updatePagination();
  }

  // ✅ تحديث الصفحة
  updatePagination(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedJournals = this.filteredJournals.slice(start, end);
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  // 🔁 فرز البيانات
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

    this.updatePagination();
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
    this.service.getById(this.projectName, journal.id).subscribe(fullJournal => {
      const dialogRef = this.dialog.open(EditJournalComponent, {
        width: '700px',
        disableClose: true,
        data: { projectName: this.projectName, journal: fullJournal }
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

  exportToExcel(): void {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('دفتر القيود اليومية', {
      views: [{ rightToLeft: true }]
    });

    // 🟢 العنوان الرئيسي
    sheet.mergeCells('A1:E1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'دفتر القيود اليومية';
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.font = { name: 'Tahoma', size: 16, bold: true, color: { argb: '00695C' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C8E6C9' } };

    // 🟢 رؤوس الأعمدة بالعربية
    const header = ['رقم المعرف', 'رقم القيد', 'التاريخ', 'الوصف', 'الحالة'];
    sheet.addRow(header);

    const headerRow = sheet.getRow(2);
    headerRow.font = { bold: true, name: 'Tahoma', size: 12 };
    headerRow.alignment = { horizontal: 'center' };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E0E0' } };

    // 🟢 عرض الأعمدة
    sheet.columns = [
      { key: 'id', width: 15 },
      { key: 'entryNumber', width: 15 },
      { key: 'date', width: 15 },
      { key: 'description', width: 45 },
      { key: 'posted', width: 15 },

    ];

    // 🟢 إضافة البيانات مع تلوين الصفوف بالتبادل
    this.filteredJournals.forEach((j, index) => {
      const row = sheet.addRow([
        j.id,
        j.entryNumber,
        new Date(j.date).toLocaleDateString('ar-EG'),
        j.description,
        j.posted ? 'مُرحّل' : 'غير مُرحّل'

      ]);

      row.font = { name: 'Tahoma', size: 11 };
      row.alignment = { horizontal: 'right' };
      if (index % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F9F9F9' } };
      }


      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'DDDDDD' } },
          left: { style: 'thin', color: { argb: 'DDDDDD' } },
          bottom: { style: 'thin', color: { argb: 'DDDDDD' } },
          right: { style: 'thin', color: { argb: 'DDDDDD' } }
        };
      });
    });

    // 🟢 إضافة الفلترة
    sheet.autoFilter = { from: 'A2', to: 'E2' };

    // 🟢 تصدير الملف
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(blob, `دفتر_القيود_اليومية_${this.projectName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
  }


openLines(journal: any) {
  this.router.navigate([`${this.projectName}/journals/${journal.id}/lines`]);
}

}
