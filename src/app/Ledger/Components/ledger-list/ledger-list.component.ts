import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { LedgerService } from '../../Services/ledger.service';
import { BarChartOptions, generaledger, PieChartOptions } from '../../Models/ledger';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ChartComponent } from 'ng-apexcharts';
import { I18nService } from '../../../Shared/Services/i18n.service';

@Component({
  selector: 'app-ledger-list',

  templateUrl: './ledger-list.component.html',
  styleUrl: './ledger-list.component.scss'
})
export class LedgerListComponent implements OnInit, AfterViewInit {

  projectName = '';
  ledger: generaledger[] = [];
  filteredledger: generaledger[] = [];
  paginatedledger: generaledger[] = [];
  searchTerm = '';
  loading = false;
  sortKey: keyof generaledger | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  startDate: string = '';
  endDate: string = '';

  pageSize = 5;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 20, 50];

  groupedLedger: any[] = [];

  pieChartOptions: PieChartOptions = {
    series: [],
    chart: { type: 'pie', height: 400 },
    labels: [],
    dataLabels: { enabled: true },
    title: { text: '', align: 'center' },
    legend: {
        labels: {
          colors: '#ffffff' // legend text white
        }
      },
      tooltip: {
        style: {
          fontSize: '14px',
          
        }
      }
  };

  barChartOptions: BarChartOptions = {
    series: [],
    chart: { type: 'bar', height: 400 },
    xaxis: { categories: [] },
    dataLabels: { enabled: false },
    stroke: { width: 2 },
    markers: { size: 3 },
    title: { text: '', align: 'center' },
    
      legend: {
        labels: {
          colors: '#ffffff' // legend text white
        }
      },
      tooltip: {
        style: {
          fontSize: '14px',
         // color: '#ffffff' // tooltip text white
        }
      }
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('pieChart') pieChart!: ChartComponent;
  @ViewChild('barChart') barChart!: ChartComponent;

  constructor(private service: LedgerService, private route: ActivatedRoute, private i18n: I18nService) { }

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

  formatDate(dateInput: string | Date | undefined): string {
    if (!dateInput) return '';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    try {
      const locale = this.i18n.currentLang === 'ar' ? 'ar-EG' : 'en-US';
      return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
    } catch (e) {
      return date.toLocaleDateString();
    }
  }

  ngOnInit(): void {
    this.projectName = this.route.snapshot.paramMap.get('project') || '';
    this.loadLedger();
  }

  ngAfterViewInit(): void {
    // Update charts after view is ready
    setTimeout(() => this.updateCharts(), 100);
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
      },
      error: (err) => console.error(err),
      complete: () => (this.loading = false)
    });
  }

  applySearch(): void {
    const term = this.searchTerm.toLowerCase();
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;

    this.filteredledger = this.ledger.filter(j => {
      const entryDate = new Date(j.date);
      const matchesText =
        j.accountName?.toLowerCase().includes(term) ||
        j.accountType?.toLowerCase().includes(term) ||
        j.description?.toLowerCase().includes(term) ||
        j.date?.toString().includes(term);
      const matchesDate = (!start || entryDate >= start) && (!end || entryDate <= end);
      return matchesText && matchesDate;
    });

    this.pageIndex = 0;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedledger = this.filteredledger.slice(start, end);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

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

  groupLedger(): void {
    const grouped: any = {};
    this.filteredledger.forEach(j => {
      if (!grouped[j.accountName]) {
        grouped[j.accountName] = { accountName: j.accountName, totalDebit: 0, totalCredit: 0, balance: 0 };
      }
      grouped[j.accountName].totalDebit += j.debit || 0;
      grouped[j.accountName].totalCredit += j.credit || 0;
      grouped[j.accountName].balance = j.balance;
    });
    this.groupedLedger = Object.values(grouped);
  }

  initCharts(): void {
    const names = this.groupedLedger.map(a => a.accountName);
    const totalDebits = this.groupedLedger.map(a => a.totalDebit);
    const totalCredits = this.groupedLedger.map(a => a.totalCredit);
    const balances = this.groupedLedger.map(a => a.balance);

    this.pieChartOptions = {
      series: totalDebits,
      chart: { type: 'pie', height: 400 },
      labels: names,
      title: {
        text: 'إجمالي المدين لكل حساب', align: 'center', style: {
          color: '#ffffff'
        }
      },
      dataLabels: {
        enabled: true, style: {
          colors: ['#ffffff']
        }
      },

      legend: {
        labels: {
          colors: '#ffffff' // legend text white
        }
      },
      tooltip: {
        style: {
          fontSize: '14px',
         // color: '#ffffff' // tooltip text white
        }
      }
    };

    this.barChartOptions = {
      series: [
        { name: 'مدين', data: totalDebits },
        { name: 'دائن', data: totalCredits },
        { name: 'الرصيد', data: balances }
      ],
      chart: { type: 'line', height: 400 },
      xaxis: {
        categories: names, labels: {
          style: {
            colors: '#ffffff' // x-axis labels white
          }
        }
      },
      dataLabels: {
        enabled: false, style: {
          colors: ['#ffffff']
        }
      },
      stroke: {
        curve: 'smooth', width: 3,
        colors: ['#ffffff']
      },
      markers: { size: 5 },
      title: {
        text: 'مقارنة المدين / الدائن / الرصيد لكل حساب', align: 'center', style: {
          color: '#ffffff'
        }
      },
      
      legend: {
        labels: {
          colors: '#ffffff' // legend text white
        }
      },
      tooltip: {
        style: {
          fontSize: '14px',
         // color: '#ffffff' // tooltip text white
        }
      }
    };

    this.updateCharts();
  }

  updateCharts(): void {
    if (this.pieChart) this.pieChart.updateOptions(this.pieChartOptions);
    if (this.barChart) this.barChart.updateOptions(this.barChartOptions);
  }

  onTabChange(event: any): void {
    // Refresh charts when switching to charts tab
    if (event.index === 1) {
      setTimeout(() => this.updateCharts(), 100);
    }
  }
  exportToExcel(): void {
    const workbook = new ExcelJS.Workbook();

    // =============================
    // 1️⃣ Sheet: إجمالي الحسابات
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

    // Header
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
    // 2️⃣ Group by account
    // =============================
    const groups = new Map<string, any[]>();

    this.filteredledger.forEach(item => {
      if (!groups.has(item.accountName)) groups.set(item.accountName, []);
      groups.get(item.accountName)!.push(item);
    });

    // للتجميع النهائي
    let sheetTotalDebit = 0;
    let sheetTotalCredit = 0;
    let sheetTotalBalance = 0;

    // =============================
    // 3️⃣ Fill summary & Create sheets
    // =============================
    groups.forEach((entries, accountName) => {
      let totalDebit = 0;
      let totalCredit = 0;

      entries.forEach(j => {
        totalDebit += j.debit;
        totalCredit += j.credit;
      });

      const finalBalance = totalDebit - totalCredit;

      // إضافة للترصيد النهائي
      sheetTotalDebit += totalDebit;
      sheetTotalCredit += totalCredit;
      sheetTotalBalance += finalBalance;

      // صف الإجمالي في شيت الإجمالي
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
      // 4️⃣ Create sheet for account
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

      // التفاصيل
      entries.forEach(j => {
        const dataRow = sheet.addRow([
          j.description,
          j.debit,
          j.credit,
          j.balance,
          new Date(j.date).toLocaleDateString(
            this.i18n.currentLang === 'ar' ? 'ar-EG' : 'en-US'
          )
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
      // 5️⃣ Total row for account sheet
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
    // 6️⃣ Add Final Total Row in Summary Sheet
    // =============================
    summarySheet.addRow([]);

    const finalRow = summarySheet.addRow([
      'الإجمالي الكلي',
      sheetTotalDebit,
      sheetTotalCredit,
      sheetTotalBalance
    ]);

    finalRow.eachCell(cell => {
      cell.font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF263238' }
      };
    });

    finalRow.getCell(2).numFmt = '#,##0.00';
    finalRow.getCell(3).numFmt = '#,##0.00';
    finalRow.getCell(4).numFmt = '#,##0.00';

    // =============================
    // 7️⃣ Auto width
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
    // 8️⃣ Save File
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





}
