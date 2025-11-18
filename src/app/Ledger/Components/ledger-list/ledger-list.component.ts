import { Component, OnInit, ViewChild } from '@angular/core';
import { LedgerService } from '../../Services/ledger.service';
import { generaledger } from '../../Models/ledger';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-ledger-list',

  templateUrl: './ledger-list.component.html',
  styleUrl: './ledger-list.component.scss'
})
export class LedgerListComponent implements OnInit {
  projectName = '';
  ledger: generaledger[] = [];
  filteredledger: generaledger[] = []; // ✅ filtered results
  paginatedledger: generaledger[] = []; // ✅ فقط الصفحة الحالية
  searchTerm = ''; // ✅ search box model
  loading = false;
  sortKey: keyof generaledger | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  startDate: string = '';
  endDate: string = '';
  // 🟢 إعدادات المقسم
  pageSize = 5;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 20, 50];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(private service: LedgerService, private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.projectName = this.route.snapshot.paramMap.get('project') || '';
    this.loadLedger();
  }
  loadLedger(): void {
    this.loading = true;
    this.service.getAll(this.projectName).subscribe({
      next: (res) => {
        this.ledger = res;
        this.filteredledger = [...res];
        this.updatePagination();
        console.log(res);
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

    this.filteredledger = this.ledger.filter(j => {
      const entryDate = new Date(j.date);
      const matchesText =
        j.accountName?.toLowerCase().includes(term) ||
        j.accountType?.toLowerCase().includes(term) ||
        j.description?.toLowerCase().includes(term) ||  j.date?.toString().includes(term);
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
    this.paginatedledger = this.filteredledger.slice(start, end);
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  // 🔁 فرز البيانات
  sortData(key: keyof generaledger): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }

    this.filteredledger.sort((a: any, b: any) => {
      const valA = a[key] ?? '';
      const valB = b[key] ?? '';
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.updatePagination();
  }

exportToExcel(): void {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('دفتر الأستاذ', {
    views: [{ rightToLeft: true }]  // RTL mode
  });

  // 🎨 HEADER STYLE
  worksheet.mergeCells('A1:G2');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `دفتر الأستاذ - مشروع ${this.projectName}`;
  titleCell.font = { size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'gradient',
    gradient: 'angle',
    degree: 45,
    stops: [
      { position: 0, color: { argb: 'FF009688' } },
      { position: 1, color: { argb: 'FF4CAF50' } },
    ],
  };

  // 🟦 COLUMN HEADERS (ARABIC)
  const header = [
    'اسم الحساب',
    'النوع',
    'الوصف',
    'مدين',
    'دائن',
    'الرصيد',
    'التاريخ'
  ];

  worksheet.addRow([]);
  const headerRow = worksheet.addRow(header);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1976D2' }, // blue header
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
    };
  });

  // 🟢 DATA ROWS
  this.filteredledger.forEach((j) => {
    const row = worksheet.addRow([
      j.accountName,
      j.accountType,
      j.description,
      j.debit,
      j.credit,
      j.balance,
      new Date(j.date).toLocaleDateString('ar-EG')
    ]);

    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFBDBDBD' } },
        left: { style: 'thin', color: { argb: 'FFBDBDBD' } },
        bottom: { style: 'thin', color: { argb: 'FFBDBDBD' } },
        right: { style: 'thin', color: { argb: 'FFBDBDBD' } },
      };
      cell.alignment = { horizontal: 'center' };
    });

    // 💰 Number columns formatting
    row.getCell(4).numFmt = '#,##0.00';
    row.getCell(5).numFmt = '#,##0.00';
    row.getCell(6).numFmt = '#,##0.00';
  });

  // 📏 Auto width
 // 📏 Auto width (SAFE VERSION — No TS errors)
worksheet.columns?.forEach((column) => {
  if (!column) return;

  let maxLength = 20;

  column.eachCell?.({ includeEmpty: true }, (cell) => {
    if (cell && cell.value != null) {
      const len = cell.value.toString().length;
      if (len > maxLength) maxLength = len + 5;
    }
  });

  column.width = maxLength;
});
  // 📂 Export
  workbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(
      new Blob([buffer]),
      `دفتر الأستاذ - ${this.projectName}.xlsx`
    );
  });
}


}
