import { Component, OnInit, ViewChild } from '@angular/core';
import { LedgerService } from '../../Services/ledger.service';
import { BarChartOptions, generaledger, PieChartOptions } from '../../Models/ledger';
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
  groupedLedger: any[] = [];
  pieChartOptions: PieChartOptions = {
    series: [],
    chart: { type: 'pie', height: 400 },
    labels: [],
    dataLabels: { enabled: true },
    title: { text: '', align: 'center' }
  };

  barChartOptions: BarChartOptions = {
    series: [],
    chart: { type: 'bar', height: 400 },
    xaxis: { categories: [] },
    dataLabels: { enabled: false },
    title: { text: '', align: 'center' }
  };


  constructor(private service: LedgerService, private route: ActivatedRoute) { }

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
        this.groupLedger();
        this.initCharts();
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
        j.description?.toLowerCase().includes(term) || j.date?.toString().includes(term);
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

    // =============================
    // 1️⃣ شيت إجمالي الحسابات
    // =============================
    const summarySheet = workbook.addWorksheet('إجمالي الحسابات', {
      views: [{ rightToLeft: true }]
    });

    // عنوان
    summarySheet.mergeCells('A1:D2');
    const title = summarySheet.getCell('A1');
    title.value = `إجمالي حسابات مشروع ${this.projectName}`;
    title.font = { size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
    title.alignment = { horizontal: 'center', vertical: 'middle' };
    title.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' }
    };

    summarySheet.addRow([]);
    const summaryHeader = summarySheet.addRow([
      'اسم الحساب',
      'إجمالي مدين',
      'إجمالي دائن',
      'الرصيد'
    ]);

    summaryHeader.eachCell(cell => {
      cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1976D2' }
      };
    });

    // =============================
    // 2️⃣ عمل جروب للحسابات
    // =============================
    const groups = new Map<string, any[]>();

    this.filteredledger.forEach(item => {
      if (!groups.has(item.accountName)) groups.set(item.accountName, []);
      groups.get(item.accountName)!.push(item);
    });

    // =============================
    // 3️⃣ تعبئة شيت الإجمالي + إنشاء شيت لكل حساب
    // =============================
    groups.forEach((entries, accountName) => {
      // إجمالي الحساب
      let totalDebit = 0;
      let totalCredit = 0;
      let finalBalance = 0;

      entries.forEach(j => {
        totalDebit += j.debit;
        totalCredit += j.credit;
        finalBalance = j.balance;
      });

      // 🟦 صف الإجمالي في Sheet الإجمالي
      const row = summarySheet.addRow([
        accountName,
        totalDebit,
        totalCredit,
        finalBalance
      ]);

      row.eachCell(cell => {
        cell.alignment = { horizontal: 'center' };
        cell.numFmt = '#,##0.00';
      });

      // =============================
      // 4️⃣ إنشاء شيت لكل حساب
      // =============================
      const sheet = workbook.addWorksheet(accountName.substring(0, 31), {
        views: [{ rightToLeft: true }]
      });

      // عنوان الحساب
      sheet.mergeCells('A1:F2');
      const accTitle = sheet.getCell('A1');
      accTitle.value = `تفاصيل حساب: ${accountName}`;
      accTitle.font = { size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
      accTitle.alignment = { horizontal: 'center', vertical: 'middle' };
      accTitle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF009688' }
      };

      sheet.addRow([]);

      // Header
      const header = sheet.addRow([
        'الوصف',
        'مدين',
        'دائن',
        'الرصيد',
        'التاريخ'
      ]);

      header.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
      });

      // البيانات التفصيلية
      entries.forEach(j => {
        const dataRow = sheet.addRow([
          j.description,
          j.debit,
          j.credit,
          j.balance,
          new Date(j.date).toLocaleDateString('ar-EG')
        ]);

        dataRow.eachCell(cell => {
          cell.alignment = { horizontal: 'center' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFBDBDBD' } },
            left: { style: 'thin', color: { argb: 'FFBDBDBD' } },
            bottom: { style: 'thin', color: { argb: 'FFBDBDBD' } },
            right: { style: 'thin', color: { argb: 'FFBDBDBD' } }
          };
        });

        dataRow.getCell(2).numFmt = '#,##0.00';
        dataRow.getCell(3).numFmt = '#,##0.00';
        dataRow.getCell(4).numFmt = '#,##0.00';
      });

      // =============================
      // 5️⃣ صف الإجمالي في شيت الحساب
      // =============================
      const totalRow = sheet.addRow([
        'الإجمالي',
        totalDebit,
        totalCredit,
        finalBalance,
        ''
      ]);

      totalRow.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF455A64' } };
      });

      totalRow.getCell(2).numFmt = '#,##0.00';
      totalRow.getCell(3).numFmt = '#,##0.00';
      totalRow.getCell(4).numFmt = '#,##0.00';
    });

    // =============================
    // 6️⃣ Auto width
    // =============================
    workbook.worksheets.forEach(ws => {
      ws.columns?.forEach(column => {
        if (!column) return;
        let maxLength = 20;
        column.eachCell?.({ includeEmpty: true }, cell => {
          if (cell?.value) {
            const len = cell.value.toString().length;
            if (len > maxLength) maxLength = len + 5;
          }
        });
        column.width = maxLength;
      });
    });

    // =============================
    // 7️⃣ حفظ الملف
    // =============================
    workbook.xlsx.writeBuffer().then(buffer => {
      saveAs(
        new Blob([buffer]),
        `دفتر الأستاذ - ${this.projectName}.xlsx`
      );
    });
  }



  getGroupedLedger() {
    const grouped: any = {};

    this.filteredledger.forEach(j => {
      if (!grouped[j.accountName]) {
        grouped[j.accountName] = {
          accountName: j.accountName,
          accountType: j.accountType,
          totalDebit: 0,
          totalCredit: 0,
          balance: 0,
          rows: []
        };
      }

      grouped[j.accountName].totalDebit += j.debit || 0;
      grouped[j.accountName].totalCredit += j.credit || 0;
      grouped[j.accountName].balance += j.balance || 0;

      grouped[j.accountName].rows.push(j);
    });

    return Object.values(grouped);
  }

  groupLedger() {
    const grouped: any = {};
    this.filteredledger.forEach(j => {
      if (!grouped[j.accountName]) {
        grouped[j.accountName] = {
          accountName: j.accountName,
          totalDebit: 0,
          totalCredit: 0,
          balance: 0
        };
      }
      grouped[j.accountName].totalDebit += j.debit || 0;
      grouped[j.accountName].totalCredit += j.credit || 0;
      grouped[j.accountName].balance = j.balance;
    });
    this.groupedLedger = Object.values(grouped);
  }


  initCharts() {
    const names = this.groupedLedger.map(a => a.accountName);
    const totalDebits = this.groupedLedger.map(a => a.totalDebit);
    const totalCredits = this.groupedLedger.map(a => a.totalCredit);
    const balances = this.groupedLedger.map(a => a.balance);

    // ===== Pie Chart (Debits) =====
    this.pieChartOptions = {
      series: totalDebits,
      chart: { type: 'pie', height: 400 },
      labels: names,
      title: { text: 'إجمالي المدين لكل حساب', align: 'center' },
      dataLabels: { enabled: true }
    };

    // ===== Bar Chart (Debit/Credit/Balance) =====
    this.barChartOptions = {
      series: [
        { name: 'مدين', data: totalDebits },
        { name: 'دائن', data: totalCredits },
        { name: 'الرصيد', data: balances }
      ],
      chart: { type: 'bar', height: 400 },
      xaxis: { categories: names },
      dataLabels: { enabled: true },
      title: { text: 'مقارنة المدين / الدائن / الرصيد لكل حساب', align: 'center' }
    };

   
  }

}
