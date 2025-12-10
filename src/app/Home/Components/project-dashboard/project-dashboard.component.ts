import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../Project/Services/project.service';
import { HomeService } from '../../Services/home.service';
import { catchError, firstValueFrom, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import {
  BalanceSheet,
  IncomeStatment,
  ProjectSummary as BaseProject,
  trialbalance,
  ApexBarChartOptions,
  ProjectSummary,
  ProjectReportResult,
  BalanceAccount
} from '../../Models/home';
import { CommonModule, CurrencyPipe, NgFor, NgIf, AsyncPipe } from '@angular/common';
import { TranslatePipe } from '../../../Shared/Pipes/translate.pipe';
import { Router } from '@angular/router';
import { I18nService } from '../../../Shared/Services/i18n.service';

import {
  NgApexchartsModule
} from 'ng-apexcharts';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);


@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, CurrencyPipe, NgApexchartsModule, TranslatePipe, AsyncPipe],
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss']
})
export class ProjectDashboardComponent implements OnInit {

  projects: ProjectSummary[] = [];
  project: ProjectSummary = {
    id: 0,
    name: '',
    loadingReports: true,
    errorReports: false,
    barChart: { series: [], chart: { type: 'bar' }, xaxis: { categories: [] }, labels: [], plotOptions: {}, dataLabels: { style: { colors: ['#ffffff'] } } },
    pieChart: { series: [], chart: { type: 'pie' }, labels: [], dataLabels: { style: { colors: ['#ffffff'] } } },
    balanceChart: { series: [], chart: { type: 'bar' }, xaxis: { categories: [] }, plotOptions: {}, labels: [], dataLabels: { style: { colors: ['#ffffff'] } } },
    isBalanced: false
  };

  loadingProjects: boolean = true;
  errorProjects: boolean = false;

  totalRevenue: number = 0;
  totalExpenses: number = 0;
  totalNetProfit: number = 0;

  // Global chart options
  globalBarChart?: ApexBarChartOptions;
  globalPieChart?: ApexBarChartOptions;
  globalTrendChart?: ApexBarChartOptions;

  // Trial balance global totals
  globalTotalDebit: number = 0;
  globalTotalCredit: number = 0;

  // local logo path (uploaded file)
  logoPath = '/assets/erp_dashboard_logo.png';
  Math = Math;
  generalb: any = null;



  // language observable for navbar
  currentLang$: any;
  currentLang: any;
  isDarkMode: boolean = true; // default (your current theme)

  constructor(
    private projectService: ProjectService,
    private homeService: HomeService,
    private router: Router,
    private i18n: I18nService
  ) {
    this.currentLang$ = this.i18n.currentLang$;
  }

  ngOnInit(): void {
    const saved = localStorage.getItem("erp-theme");
    this.isDarkMode = saved ? saved === 'dark' : true;

    this.applyTheme();
    this.loadProjects();
  }


  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem("erp-theme", this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  applyTheme(): void {
    const body = document.body;

    if (this.isDarkMode) {
      body.classList.add("dark-theme");
      body.classList.remove("light-theme");
    } else {
      body.classList.add("light-theme");
      body.classList.remove("dark-theme");
    }
  }

  loadProjects(): void {
    this.loadingProjects = true;
    this.errorProjects = false;

    this.projectService.getProjects().pipe(
      map(projects =>
        projects.map(p => ({
          ...p,
          loadingReports: true,
          errorReports: false,
          isBalanced: false,
          expanded: false,
          barChart: undefined,
          pieChart: undefined,
          balanceChart: undefined
        }) as ProjectSummary)
      ),
      switchMap(projects => {
        this.projects = projects;
        if (projects.length === 0) return of([]);

        const reportObservables = projects.map(project =>
          this.fetchProjectReports(project.name).pipe(
            map(reports => ({ project, reports }) as ProjectReportResult),
            catchError(err => {
              console.error(`Report fetch error for ${project.name}`, err);
              return of({ project, reports: null } as ProjectReportResult);
            })
          )
        );

        return forkJoin(reportObservables);
      })
    ).subscribe(
      (results: ProjectReportResult[]) => {
        console.log(results);
        this.loadingProjects = false;

        // Reset global totals
        this.totalRevenue = 0;
        this.totalExpenses = 0;
        this.globalTotalDebit = 0;
        this.globalTotalCredit = 0;

        // Colors for dark mode
        const revenueColor = '#4ade80'; // bright green
        const expenseColor = '#f87171'; // soft red
        const debitColor = '#60a5fa';   // light blue
        const creditColor = '#fbbf24';  // gold/yellow

        // Loop through each project result
        results.forEach(result => {
          const projIndex = this.projects.findIndex(p => p.name === result.project.name);
          if (projIndex === -1) return;

          const project = this.projects[projIndex];
          project.loadingReports = false;

          if (!result.reports) {
            project.errorReports = true;
            return;
          }

          const { incomeStatement, balanceSheet, trialBalance, availableCash } = result.reports;

          // Assign report data
          project.incomeStatement = incomeStatement;
          project.balanceSheet = balanceSheet;
          project.trialBalance = trialBalance;
          project.availableCash = availableCash ?? 0;

          // ===== Trial Balance Check =====
          const totalDebit = trialBalance.reduce((sum, tb) => sum + tb.debit, 0);
          const totalCredit = trialBalance.reduce((sum, tb) => sum + tb.credit, 0);
          project.isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

          // Accumulate global totals
          this.totalRevenue += incomeStatement.totalRevenue ?? 0;
          this.totalExpenses += incomeStatement.totalExpense ?? 0;
          this.globalTotalDebit += totalDebit;
          this.globalTotalCredit += totalCredit;

          // ===== Labels =====
          const revenueLabel = this.i18n.instant('REVENUE');
          const expenseLabel = this.i18n.instant('EXPENSE');
          const debitLabel = this.i18n.instant('DEBIT');
          const creditLabel = this.i18n.instant('CREDIT');

          // ===== Project Charts =====
          project.barChart = {
            series: [
              { name: revenueLabel, data: [incomeStatement.totalRevenue ?? 0] },
              { name: expenseLabel, data: [incomeStatement.totalExpense ?? 0] }
            ],
            chart: {
              type: 'bar',
              height: 160,
              background: 'transparent',
              toolbar: { show: true },
              foreColor: '#ffffff',
              animations: { enabled: true, easing: 'easeout', speed: 600 }
            },
            colors: [revenueColor, expenseColor],
            xaxis: { categories: [''], labels: { style: { colors: ['#ffffff'] } } },
            yaxis: { labels: { style: { colors: ['#ffffff'] } } },
            plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
            dataLabels: { style: { colors: ['#ffffff'] } },
            legend: { labels: { colors: '#ffffff' } },
            tooltip: { enabled: false },
            labels: ['']
          };

          project.pieChart = {
            series: [incomeStatement.totalRevenue ?? 0, incomeStatement.totalExpense ?? 0],
            chart: {
              type: 'pie',
              height: 160,
              background: 'transparent',
              toolbar: { show: false },
              foreColor: '#ffffff',
              animations: { enabled: true, easing: 'easeout', speed: 600 }
            },
            colors: [revenueColor, expenseColor],
            labels: [revenueLabel, expenseLabel],
            dataLabels: { style: { colors: ['#ffffff'] } },
            legend: { labels: { colors: '#ffffff' } },
            tooltip: { enabled: false },
          };

          project.balanceChart = {
            series: [{ name: this.i18n.instant('AMOUNT') || 'Amount', data: [totalDebit, totalCredit] }],
            chart: {
              type: 'bar',
              height: 140,
              background: 'transparent',
              toolbar: { show: false },
              foreColor: '#ffffff',
              animations: { enabled: true, easing: 'easeout', speed: 600 }
            },
            colors: [debitColor, creditColor],
            xaxis: { categories: [debitLabel, creditLabel], labels: { style: { colors: ['#ffffff'] } } },
            yaxis: { labels: { style: { colors: ['#ffffff'] } } },
            plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
            dataLabels: { style: { colors: ['#ffffff'] } },
            legend: { labels: { colors: '#ffffff' } },
            tooltip: { enabled: false },
            labels: [''],
          };
        });

        // ===== Global Charts Labels =====
        const revenueLabel = this.i18n.instant('REVENUE');
        const expenseLabel = this.i18n.instant('EXPENSE');
        const totalRevenueLabel = this.i18n.instant('TOTAL_REVENUE');
        const totalExpensesLabel = this.i18n.instant('TOTAL_EXPENSES');
        const allProjectsLabel = this.i18n.instant('ALL_PROJECTS');

        // ===== Global Charts =====
        this.globalBarChart = {
          series: [
            { name: revenueLabel, data: [this.totalRevenue] },
            { name: expenseLabel, data: [this.totalExpenses] }
          ],
          chart: { type: 'bar', height: 220, background: 'transparent', toolbar: { show: false }, foreColor: '#ffffff' },
          colors: [revenueColor, expenseColor],
          xaxis: { categories: [allProjectsLabel], labels: { style: { colors: ['#ffffff'] } } },
          plotOptions: { bar: { horizontal: false, columnWidth: '45%' } },
          labels: [revenueLabel, expenseLabel]
        };

        this.globalPieChart = {
          series: [this.totalRevenue, this.totalExpenses],
          chart: { type: 'pie', height: 240, background: 'transparent', toolbar: { show: false }, foreColor: '#ffffff' },
          colors: [revenueColor, expenseColor],
          labels: [totalRevenueLabel, totalExpensesLabel],
          dataLabels: { style: { colors: ['#ffffff'] } },
          legend: { labels: { colors: '#ffffff' } },
          tooltip: { enabled: false }

        };

        this.globalTrendChart = {
          series: [
            { name: revenueLabel, data: results.map(r => r.reports?.incomeStatement?.totalRevenue ?? 0) },
            { name: expenseLabel, data: results.map(r => r.reports?.incomeStatement?.totalExpense ?? 0) }
          ],
          chart: { type: 'line', height: 200, background: 'transparent', toolbar: { show: false }, foreColor: '#ffffff', animations: { enabled: true, easing: 'easeout', speed: 700 } },
          xaxis: { categories: this.projects.map(p => p.name), labels: { style: { colors: ['#ffffff'] } } },
          yaxis: { labels: { style: { colors: ['#ffffff'] } } },
          dataLabels: { style: { colors: ['#ffffff'] } },
          legend: { labels: { colors: '#ffffff' } },
          tooltip: { enabled: false },
          labels: [allProjectsLabel],
        };

        // Compute net profit
        this.totalNetProfit = this.totalRevenue - this.totalExpenses;
      },
      err => {
        console.error('Error loading projects:', err);
        this.loadingProjects = false;
        this.errorProjects = true;
      }
    );
  }



  fetchProjectReports(projectName: string): Observable<{
    incomeStatement: IncomeStatment, balanceSheet: BalanceSheet[], trialBalance: trialbalance[],
    availableCash: number
  }> {
    return forkJoin({
      incomeStatement: this.homeService.getIncomeStatement(projectName),
      balanceSheet: this.homeService.getBalanceSheet(projectName),
      trialBalance: this.homeService.getTrailBalance(projectName),
      availableCash: this.homeService.getAvailableCash(projectName)
    });
  }

  getNetProfit(project: ProjectSummary): number {
    return project.incomeStatement
      ? (project.incomeStatement.totalRevenue ?? 0) - (project.incomeStatement.totalExpense ?? 0)
      : 0;
  }

  toggleProject(project: ProjectSummary) {
    project.expanded = !project.expanded;
  }

  // compute rotation angle for balance scale (visual)
  getScaleRotation(): string {
    const diff = this.globalTotalDebit - this.globalTotalCredit;
    // small angle mapping: diff -> -20..20 degrees
    const maxAngle = 18;
    const maxDiff = Math.max(1, Math.abs(diff));
    // normalized factor (clamp)
    const factor = Math.max(-1, Math.min(1, diff / (this.globalTotalDebit + this.globalTotalCredit || 1)));
    const angle = factor * maxAngle;
    return `rotate(${angle}deg)`;
  }


  abs(x: number) {
    return Math.abs(x);
  }

  isBalanced() {
    return Math.abs(this.globalTotalDebit - this.globalTotalCredit) < 0.01;
  }

  goHome(): void {
    this.router.navigate(['/projects']);
  }

  toggleLanguage(): void {
    this.i18n.toggleLanguage();
  }

  gotoDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
  // component.ts
  accountTypeTranslationMap: { [key: string]: string } = {
    'Asset': 'ASSET',
    'Contra Asset': 'CONTRA_ASSET',
    'Current Asset': 'CURRENT_ASSET',
    'Liability': 'LIABILITY',
    'Contra Liability': 'CONTRA_LIABILITY',
    'Current Liability': 'CURRENT_LIABILITY',
    'Equity': 'EQUITY',
    'Revenue': 'REVENUE',
    'Expense': 'EXPENSE'
  };

  goToStartHome(): void {
    this.router.navigate(['/start-home']);
  }
  downloadGeneralBalance(projectName: string) {
    this.homeService.getGeneralBalanceSheet(projectName)
      .subscribe({
        next: (data) => {
          this.generalb = data;      // ← تخزين الداتا هنا
          this.exportGeneralBalanceToExcel(projectName);  // ← ثم التصدير
        },
        error: (err) => {
          console.error("خطأ أثناء تحميل الميزانية", err);
        }
      });
  }

  async exportGeneralBalanceToExcel(projectName: string) {
    if (!this.generalb) {
      console.error("لا يوجد بيانات للتصدير");
      return;
    }

    const data = this.generalb;
    const step1 = data.step1;
    const step2 = data.step2;
    const balance = data.balanceSheet;

    // ------------------ CALCULATIONS ------------------
    const totalRevenue = step1.totalRevenue;

    const diversifiedTotal = step2.diversifiedRevenue.reduce(
      (sum: number, x: any) => sum + x.finalBalance, 0
    );

    const totalRevenueAfterDiversified = totalRevenue + diversifiedTotal;

    const totalExpenses = step2.expenses.reduce(
      (sum: number, x: any) => sum + x.finalBalance, 0
    );

    // ------------------ CREATE WORKBOOK ------------------
    const workbook = new ExcelJS.Workbook();

    // ============================================================
    // 1) BALANCE SHEET — ASSETS LEFT, LIABILITIES & EQUITY RIGHT
    // ============================================================
    const sheet = workbook.addWorksheet("الميزانية العمومية", {
      views: [{ rightToLeft: true }]
    });

    sheet.mergeCells("A1:H2");
    const head = sheet.getCell("A1");
    head.value = `الميزانية العمومية لمشروع ${projectName}`;
    head.font = { size: 18, bold: true, color: { argb: "FFFFFFFF" } };
    head.alignment = { horizontal: "center", vertical: "middle" };
    head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4CAF50" } };

    sheet.addRow([]);
    sheet.addRow([]);

    // ------------------ SPLIT ACCOUNTS ------------------
    const assets = balance.assets.filter((a: BalanceAccount) => a.accountType === "Asset");
    const contraAssets = balance.assets.filter((a: BalanceAccount) => a.accountType === "Contra Asset");
    const currentAssets = balance.assets.filter((a: BalanceAccount) => a.accountType === "Current Asset");

    const liabilities = balance.liabilities;
    const equity = [{ accountName: "صافي الربح", finalBalance: step2.netProfit }];

    // ------------------ HEADER ------------------
    const header = sheet.addRow([
      "الأصول", "", "", "",
      "الخصوم وحقوق الملكية", "", "", ""
    ]);
    header.font = { bold: true };
    header.eachCell(c => c.border = {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" }
    });

    // ------------------ ASSETS LEFT — LIABILITIES RIGHT ------------------
    const maxRows = Math.max(assets.length, liabilities.length);

    for (let i = 0; i < maxRows; i++) {
      const A = assets[i];
      const L = liabilities[i];

      const row = sheet.addRow([
        A?.accountName || "", "", "", A?.finalBalance || "",
        L?.accountName || "", "", "", L?.finalBalance || ""
      ]);

      row.font = { bold: true };
      row.eachCell(c => c.border = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" }
      });
    }

    sheet.addRow([]);

    // ------------------ EQUITY RIGHT ------------------
    const eqTitle = sheet.addRow(["", "", "", "", "حقوق الملكية", "", "", ""]);
    eqTitle.font = { bold: true };

    equity.forEach(eq => {
      const r = sheet.addRow(["", "", "", "", eq.accountName, "", "", eq.finalBalance]);
      r.font = { bold: true };
      r.eachCell(c => c.border = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" }
      });
    });

    sheet.addRow([]);

    // ------------------ CURRENT + CONTRA ASSETS (LEFT BOTTOM) ------------------
    const leftTitle = sheet.addRow(["الأصول المتداولة وخصم الأصول", "", "", "", "", "", "", ""]);
    leftTitle.font = { bold: true };

    const extra = Math.max(currentAssets.length, contraAssets.length);

    for (let i = 0; i < extra; i++) {
      const CA = currentAssets[i];
      const C = contraAssets[i];

      const row = sheet.addRow([
        CA?.accountName || C?.accountName || "",
        "",
        "",
        CA?.finalBalance ?? C?.finalBalance ?? "",
        "",
        "",
        "",
        ""
      ]);

      row.font = { bold: true };
      row.eachCell(c => c.border = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" }
      });
    }

    sheet.addRow([]);

    // ------------------ TOTALS ------------------
    const totals = sheet.addRow([
      "إجمالي الأصول", "", "", balance.totalAssets,
      "إجمالي الخصوم وحقوق الملكية", "", "", balance.totalLiabilities + step2.netProfit
    ]);

    totals.font = { bold: true };
    totals.eachCell(c => c.border = {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" }
    });

    // Auto width
    sheet.columns.forEach(col => {
      if (!col || !col.eachCell) return;
      let max = 12;
      col.eachCell({ includeEmpty: true }, cell => {
        if (cell.value) max = Math.max(max, cell.value.toString().length + 5);
      });
      col.width = max;
    });

    // ============================================================
    // 2) INCOME STATEMENT (Two-column, bordered)
    // ============================================================
    const isheet = workbook.addWorksheet("قائمة الدخل", {
      views: [{ rightToLeft: true }]
    });

    isheet.mergeCells("A1:D2");
    const t = isheet.getCell("A1");
    t.value = `قائمة الدخل لمشروع ${projectName}`;
    t.font = { bold: true, size: 18, color: { argb: "FFFFFFFF" } };
    t.alignment = { horizontal: "center", vertical: "middle" };
    t.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6A1B9A" } };

    isheet.addRow([]);

    // HEADER
    const ish = isheet.addRow(["البند", "القيمة", "البند", "القيمة"]);
    ish.font = { bold: true };
    ish.eachCell(c => c.border = {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" }
    });

    // ------------------ REVENUES ------------------
    isheet.addRow(["الإيرادات", "", "", ""]).font = { bold: true };

    step1.revenues.forEach((rev: any) => {
      const row = isheet.addRow([rev.accountName, rev.finalBalance, "", ""]);
      row.eachCell(c => c.border = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" }
      });
    });

    // ------------------ COGS ------------------
    isheet.addRow(["تكلفة البضاعة المباعة", "", "", ""]).font = { bold: true };

    step1.cogs.forEach((cg: any) => {
      const row = isheet.addRow(["", "", cg.accountName, cg.finalBalance]);
      row.eachCell(c => c.border = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" }
      });
    });

    // ------------------ TOTAL AFTER COGS ------------------
    const r1 = isheet.addRow([
      "إجمالي الإيرادات (بعد خصم تكلفة البضاعة المباعة)",
      totalRevenue, "", ""
    ]);
    r1.font = { bold: true };
    r1.eachCell(c => c.border = {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" }
    });

    // ------------------ DIVERSIFIED REVENUE ------------------
    isheet.addRow(["الإيرادات المتنوعة", "", "", ""]).font = { bold: true };

    step2.diversifiedRevenue.forEach((d: any) => {
      const row = isheet.addRow([d.accountName, d.finalBalance, "", ""]);
      row.eachCell(c => c.border = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" }
      });
    });

    // ------------------ TOTAL AFTER DIVERSIFIED ------------------
    const r2 = isheet.addRow([
      "إجمالي الإيرادات بعد إضافة الإيرادات المتنوعة",
      totalRevenueAfterDiversified, "", ""
    ]);
    r2.font = { bold: true };
    r2.eachCell(c => c.border = {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" }
    });

    // ------------------ EXPENSES ------------------
    isheet.addRow(["المصروفات", "", "", ""]).font = { bold: true };

    step2.expenses.forEach((exp: any) => {
      const row = isheet.addRow(["", "", exp.accountName, exp.finalBalance]);
      row.eachCell(c => c.border = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" }
      });
    });

    // ------------------ NET PROFIT ------------------
    const np = isheet.addRow(["صافي الربح", step2.netProfit, "", ""]);
    np.font = { bold: true };
    np.eachCell(c => c.border = {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" }
    });

    // Auto width
    isheet.columns.forEach(col => {
      if (!col || !col.eachCell) return;
      let max = 12;
      col.eachCell({ includeEmpty: true }, cell => {
        if (cell.value) max = Math.max(max, cell.value.toString().length + 5);
      });
      col.width = max;
    });

    // ============================================================
    // 3) CHART SHEET
    // ============================================================
    const chartSheet = workbook.addWorksheet("Chart", {
      views: [{ rightToLeft: true }]
    });

    chartSheet.addRow(["الفئة", "القيمة"]);
    chartSheet.addRow(["إجمالي الإيرادات", totalRevenue]);
    chartSheet.addRow(["الإيرادات المتنوعة", diversifiedTotal]);
    chartSheet.addRow(["المصروفات", totalExpenses]);
    chartSheet.addRow(["صافي الربح", step2.netProfit]);

    const img = workbook.addImage({
      base64: this.generateChartBase64(
        ["إيرادات", "إيرادات متنوعة", "مصروفات", "ربح"],
        [
          totalRevenue,
          diversifiedTotal,
          totalExpenses,
          step2.netProfit
        ]
      ),
      extension: "png"
    });

    chartSheet.addImage(img, {
      tl: { col: 1, row: 6 },
      ext: { width: 650, height: 420 }
    });

    // Auto width
    chartSheet.columns.forEach(col => {
      if (!col || !col.eachCell) return;
      let max = 12;
      col.eachCell({ includeEmpty: true }, cell => {
        if (cell.value) max = Math.max(max, cell.value.toString().length + 5);
      });
      col.width = max;
    });

    // ------------------ SAVE FILE ------------------
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `General Balance - ${projectName}.xlsx`);
  }




  generateChartBase64(labels: string[], data: number[]): string {
    // Create browser canvas
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 400;

    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const max = Math.max(...data);
    const barWidth = 150;
    const gap = 80;

    labels.forEach((label, i) => {
      const x = i * (barWidth + gap) + 80;
      const barHeight = (data[i] / max) * 250;

      // Bar color
      ctx.fillStyle = "#1976D2";
      ctx.fillRect(x, canvas.height - barHeight - 50, barWidth, barHeight);

      // Label text
      ctx.fillStyle = "#000";
      ctx.font = "bold 18px Arial";
      ctx.fillText(label, x + 20, canvas.height - 10);

      // Top value
      ctx.fillText(
        data[i].toLocaleString(),
        x + 20,
        canvas.height - barHeight - 60
      );
    });

    // Return Base64 **without prefix**
    return canvas.toDataURL("image/png").split(",")[1];
  }

  createIncomeStatementChart(data: any) {
    const ctx = document.getElementById('incomeChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Total Revenue', 'COGS', 'Diversified Revenue', 'Expenses', 'Net Profit'],
        datasets: [{
          label: 'Value',
          data: [
            data.step1.totalRevenue,
            data.step1.cogsTotal,
            data.step2.diversifiedRevenueTotal,
            data.step2.expensesTotal,
            data.step2.netProfit
          ],
          backgroundColor: [
            '#4CAF50',
            '#FF7043',
            '#42A5F5',
            '#EF5350',
            '#8E24AA'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        }
      }
    });
  }



  /**
 * تصدير ميزانية عامة مجمّعة لكل المشروعات (Balance Sheet + Income Statement + Chart)
 * - Option C2: Totals only per main category (Assets, Liabilities, Equity, Revenues, Expenses, Net Profit)
 */
  async exportAllProjectsGeneralBalanceToExcel(): Promise<void> {
    if (!this.projects || this.projects.length === 0) {
      console.error('لا يوجد مشروعات للتصدير');
      return;
    }

    try {
      // 1) Fetch general balance for each project
      const requests = this.projects.map(project =>
        this.homeService.getGeneralBalanceSheet(project.name).pipe(
          map(data => ({ projectName: project.name, data })),
          catchError(err => {
            console.error('خطأ أثناء تحميل الميزانية للمشروع', project.name, err);
            return of(null);
          })
        )
      );

      const results = await firstValueFrom(forkJoin(requests));

      const validResults = (results as Array<{ projectName: string; data: any } | null>)
        .filter((x): x is { projectName: string; data: any } => x !== null);

      if (validResults.length === 0) {
        console.error('لا يوجد بيانات صالحة للتصدير');
        return;
      }

      // 2) Aggregate across all projects (Option C2 → totals only)
      let totalAssetsAll = 0;
      let totalLiabilitiesAll = 0;

      let totalRevenueAfterCogsAll = 0;     // Σ(step1.totalRevenue)
      let diversifiedTotalAll = 0;          // Σ(diversifiedRevenue)
      let totalExpensesAll = 0;             // Σ(expenses)
      let totalNetProfitAll = 0;            // Σ(netProfit)

      validResults.forEach(({ data }) => {
        const step1 = data.step1;
        const step2 = data.step2;
        const balanceSheet = data.balanceSheet;

        // Balance sheet totals
        totalAssetsAll += balanceSheet.totalAssets;
        totalLiabilitiesAll += balanceSheet.totalLiabilities;

        // Income totals
        totalRevenueAfterCogsAll += step1.totalRevenue;

        const diversifiedSum = (step2.diversifiedRevenue as BalanceAccount[]).reduce(
          (sum: number, x: BalanceAccount) => sum + x.finalBalance,
          0
        );
        diversifiedTotalAll += diversifiedSum;

        const expensesSum = (step2.expenses as BalanceAccount[]).reduce(
          (sum: number, x: BalanceAccount) => sum + x.finalBalance,
          0
        );
        totalExpensesAll += expensesSum;

        totalNetProfitAll += step2.netProfit;
      });

      // For this model, نعتبر حقوق الملكية = مجموع صافي أرباح كل المشروعات
      const totalEquityAll = totalNetProfitAll;
      const totalLiabilitiesAndEquityAll = totalLiabilitiesAll + totalEquityAll;
      const totalRevenueAfterDiversifiedAll = totalRevenueAfterCogsAll + diversifiedTotalAll;

      // 3) Create Workbook
      const workbook = new ExcelJS.Workbook();

      // ============================================================
      // 1) BALANCE SHEET (ALL PROJECTS)
      // ============================================================
      const sheet = workbook.addWorksheet('الميزانية العمومية - كل المشروعات', {
        views: [{ rightToLeft: true }]
      });

      sheet.mergeCells('A1:H2');
      const head = sheet.getCell('A1');
      head.value = 'الميزانية العمومية المجمّعة لكل المشروعات';
      head.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
      head.alignment = { horizontal: 'center', vertical: 'middle' };
      head.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4CAF50' }
      };

      sheet.addRow([]);
      sheet.addRow([]);

      // Header row
      const header = sheet.addRow([
        'الأصول (كل المشروعات)', '', '', '',
        'الخصوم وحقوق الملكية (كل المشروعات)', '', '', ''
      ]);
      header.font = { bold: true };
      header.eachCell(c => {
        c.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Row: Total Assets vs Total Liabilities
      const row1 = sheet.addRow([
        'إجمالي الأصول',
        '',
        '',
        totalAssetsAll,
        'إجمالي الخصوم',
        '',
        '',
        totalLiabilitiesAll
      ]);
      row1.font = { bold: true };
      row1.eachCell(c => {
        c.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Row: Equity (Net profit of all projects)
      const row2 = sheet.addRow([
        '',
        '',
        '',
        '',
        'إجمالي حقوق الملكية (صافي أرباح كل المشروعات)',
        '',
        '',
        totalEquityAll
      ]);
      row2.font = { bold: true };
      row2.eachCell(c => {
        c.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      sheet.addRow([]);

      // Final control row: Assets vs Liabilities + Equity
      const totalsRow = sheet.addRow([
        'إجمالي الأصول',
        '',
        '',
        totalAssetsAll,
        'إجمالي الخصوم وحقوق الملكية',
        '',
        '',
        totalLiabilitiesAndEquityAll
      ]);
      totalsRow.font = { bold: true };
      totalsRow.eachCell(c => {
        c.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Auto width for balance sheet
      sheet.columns.forEach(col => {
        if (!col || !col.eachCell) return;
        let max = 12;
        col.eachCell({ includeEmpty: true }, cell => {
          if (cell.value) {
            max = Math.max(max, cell.value.toString().length + 5);
          }
        });
        col.width = max;
      });

      // ============================================================
      // 2) INCOME STATEMENT (ALL PROJECTS)
      // ============================================================
      const isheet = workbook.addWorksheet('قائمة الدخل - كل المشروعات', {
        views: [{ rightToLeft: true }]
      });

      isheet.mergeCells('A1:D2');
      const t = isheet.getCell('A1');
      t.value = 'قائمة الدخل المجمّعة لكل المشروعات';
      t.font = { bold: true, size: 18, color: { argb: 'FFFFFFFF' } };
      t.alignment = { horizontal: 'center', vertical: 'middle' };
      t.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF6A1B9A' }
      };

      isheet.addRow([]);

      const ish = isheet.addRow(['البند', 'القيمة', 'البند', 'القيمة']);
      ish.font = { bold: true };
      ish.eachCell(c => {
        c.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Total Revenue after COGS
      const ir1 = isheet.addRow([
        'إجمالي الإيرادات (بعد خصم تكلفة البضاعة المباعة) – كل المشروعات',
        totalRevenueAfterCogsAll,
        '',
        ''
      ]);
      ir1.font = { bold: true };
      ir1.eachCell(c => {
        c.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Diversified Revenue total
      const ir2 = isheet.addRow([
        'إجمالي الإيرادات المتنوعة – كل المشروعات',
        diversifiedTotalAll,
        '',
        ''
      ]);
      ir2.font = { bold: true };
      ir2.eachCell(c => {
        c.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Total Revenue after adding diversified
      const ir3 = isheet.addRow([
        'إجمالي الإيرادات بعد إضافة الإيرادات المتنوعة – كل المشروعات',
        totalRevenueAfterDiversifiedAll,
        '',
        ''
      ]);
      ir3.font = { bold: true };
      ir3.eachCell(c => {
        c.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Total Expenses
      const ir4 = isheet.addRow([
        'إجمالي المصروفات – كل المشروعات',
        totalExpensesAll,
        '',
        ''
      ]);
      ir4.font = { bold: true };
      ir4.eachCell(c => {
        c.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Net profit
      const ir5 = isheet.addRow([
        'صافي الربح المجمّع – كل المشروعات',
        totalNetProfitAll,
        '',
        ''
      ]);
      ir5.font = { bold: true };
      ir5.eachCell(c => {
        c.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Auto width
      isheet.columns.forEach(col => {
        if (!col || !col.eachCell) return;
        let max = 12;
        col.eachCell({ includeEmpty: true }, cell => {
          if (cell.value) {
            max = Math.max(max, cell.value.toString().length + 5);
          }
        });
        col.width = max;
      });

      // ============================================================
      // 3) CHART SHEET (ALL PROJECTS)
      // ============================================================
      const chartSheet = workbook.addWorksheet('Chart - All Projects', {
        views: [{ rightToLeft: true }]
      });

      chartSheet.addRow(['الفئة', 'القيمة']);
      chartSheet.addRow(['إجمالي الإيرادات', totalRevenueAfterCogsAll]);
      chartSheet.addRow(['الإيرادات المتنوعة', diversifiedTotalAll]);
      chartSheet.addRow(['المصروفات', totalExpensesAll]);
      chartSheet.addRow(['صافي الربح', totalNetProfitAll]);

      const img = workbook.addImage({
        base64: this.generateChartBase64(
          ['إيرادات', 'إيرادات متنوعة', 'مصروفات', 'ربح'],
          [
            totalRevenueAfterCogsAll,
            diversifiedTotalAll,
            totalExpensesAll,
            totalNetProfitAll
          ]
        ),
        extension: 'png'
      });

      chartSheet.addImage(img, {
        tl: { col: 1, row: 6 },
        ext: { width: 650, height: 420 }
      });

      chartSheet.columns.forEach(col => {
        if (!col || !col.eachCell) return;
        let max = 12;
        col.eachCell({ includeEmpty: true }, cell => {
          if (cell.value) {
            max = Math.max(max, cell.value.toString().length + 5);
          }
        });
        col.width = max;
      });

      // 4) Save file
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `General Balance - ALL PROJECTS.xlsx`);
    } catch (err) {
      console.error('خطأ أثناء إنشاء ملف الميزانية المجمّعة', err);
    }
  }



}
//=========================================Charts Styles==============================================================================/



/*
  // ألوان موحدة تناسب الخلفية الداكنة
 DARK_THEME_COLORS = ['#3b82f6', '#ef4444', '#facc15', '#10b981', '#8b5cf6'];
 
 CHART_TEXT_COLOR = '#ffffff';
 
 getBarChart(seriesData: any[], categories: string[]) {
  return {
    series: seriesData,
    chart: {
      type: 'bar',
      height: 180,
      background: 'transparent',
      toolbar: { show: false },
      foreColor: this.CHART_TEXT_COLOR,
      animations: { enabled: true, easing: 'easeout', speed: 600 }
    },
    colors: this.DARK_THEME_COLORS,
    xaxis: { categories, labels: { style: { colors: [this.CHART_TEXT_COLOR] } } },
    yaxis: { labels: { style: { colors: [this.CHART_TEXT_COLOR] } } },
    plotOptions: { bar: { horizontal: false, columnWidth: '50%' } },
    dataLabels: { style: { colors: [this.CHART_TEXT_COLOR] } },
    legend: { labels: { colors: this.CHART_TEXT_COLOR } },
    tooltip: { style: { fontSize: '14px' } },
    title: { style: { color: this.CHART_TEXT_COLOR } }
  };
}
 
 getPieChart(seriesData: number[], labels: string[]) {
  return {
    series: seriesData,
    chart: {
      type: 'pie',
      height: 160,
      background: 'transparent',
      toolbar: { show: false },
      foreColor: this.CHART_TEXT_COLOR,
      animations: { enabled: true, easing: 'easeout', speed: 600 }
    },
    colors: this.DARK_THEME_COLORS,
    labels,
    dataLabels: { style: { colors: [this.CHART_TEXT_COLOR] } },
    legend: { labels: { colors: this.CHART_TEXT_COLOR } },
    tooltip: { style: { fontSize: '14px' } },
    title: { style: { color: this.CHART_TEXT_COLOR } }
  };
}
 
 getLineChart(seriesData: any[], categories: string[]) {
  return {
    series: seriesData,
    chart: {
      type: 'line',
      height: 200,
      background: 'transparent',
      toolbar: { show: false },
      foreColor: this.CHART_TEXT_COLOR,
      animations: { enabled: true, easing: 'easeout', speed: 700 }
    },
    xaxis: { categories, labels: { style: { colors: [this.CHART_TEXT_COLOR] } } },
    yaxis: { labels: { style: { colors: [this.CHART_TEXT_COLOR] } } },
    dataLabels: { style: { colors: [this.CHART_TEXT_COLOR] } },
    legend: { labels: { colors: this.CHART_TEXT_COLOR } },
    tooltip: { style: { fontSize: '14px' } },
    title: { style: { color: this.CHART_TEXT_COLOR } }
  };
}
*/

/*
loadProjects(): void {
  this.loadingProjects = true;
  this.errorProjects = false;
 
  this.projectService.getProjects().pipe(
    map(projects =>
      projects.map(p => ({
        ...p,
        loadingReports: true,
        errorReports: false,
        isBalanced: false,
        expanded: false, // for per-project details toggle
        barChart: undefined,
        pieChart: undefined,
        balanceChart: undefined
      }) as ProjectSummary)
    ),
    switchMap(projects => {
      this.projects = projects;
      if (projects.length === 0) return of([]);
 
      const reportObservables = projects.map(project =>
        this.fetchProjectReports(project.name).pipe(
          map(reports => ({ project, reports }) as ProjectReportResult),
          catchError(err => {
            console.error(`Report fetch error for ${project.name}`, err);
            return of({ project, reports: null } as ProjectReportResult);
          })
        )
      );
 
      return forkJoin(reportObservables);
    })
  ).subscribe(
    (results: ProjectReportResult[]) => {
      console.log(results);
      this.loadingProjects = false;
 
      // Reset global totals
      this.totalRevenue = 0;
      this.totalExpenses = 0;
      this.globalTotalDebit = 0;
      this.globalTotalCredit = 0;
 
      // Loop through each project result
      results.forEach(result => {
        const projIndex = this.projects.findIndex(p => p.name === result.project.name);
        if (projIndex === -1) return;
 
        const project = this.projects[projIndex];
        project.loadingReports = false;
 
        if (!result.reports) {
          project.errorReports = true;
          return;
        }
 
        const { incomeStatement, balanceSheet, trialBalance, availableCash } = result.reports;
 
        // Assign report data
        project.incomeStatement = incomeStatement;
        project.balanceSheet = balanceSheet;
        project.trialBalance = trialBalance;
        project.availableCash = availableCash ?? 0;
 
        // ===== Trial Balance Check =====
        const totalDebit = trialBalance.reduce((sum, tb) => sum + tb.debit, 0);
        const totalCredit = trialBalance.reduce((sum, tb) => sum + tb.credit, 0);
        project.isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
 
        // Accumulate global totals
        this.totalRevenue += incomeStatement.totalRevenue ?? 0;
        this.totalExpenses += incomeStatement.totalExpense ?? 0;
        this.globalTotalDebit += totalDebit;
        this.globalTotalCredit += totalCredit;
 
        // ===== Labels =====
        const revenueLabel = this.i18n.instant('REVENUE');
        const expenseLabel = this.i18n.instant('EXPENSE');
        const debitLabel = this.i18n.instant('DEBIT');
        const creditLabel = this.i18n.instant('CREDIT');
 
        // ===== Project Charts =====
        project.barChart = {
          series: [
            { name: revenueLabel, data: [incomeStatement.totalRevenue ?? 0] },
            { name: expenseLabel, data: [incomeStatement.totalExpense ?? 0] }
          ],
          chart: {
            type: 'bar',
            height: 160,
            animations: { enabled: true, easing: 'easeout', speed: 600 },
            background: 'transparent',
            toolbar: { show: false },
            foreColor: '#ffffff'
          },
          colors: ['#3b82f6', '#ef4444'],
          xaxis: { categories: [''], labels: { style: { colors: ['#ffffff'] } } },
          yaxis: { labels: { style: { colors: ['#ffffff'] } } },
          plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
          dataLabels: { style: { colors: ['#ffffff'] } },
          labels: [revenueLabel, expenseLabel],
          title: { style: { color: '#ffffff' } },
          legend: { labels: { colors: '#ffffff' } },
          tooltip: { style: { fontSize: '14px' } }
        };
 
        project.pieChart = {
          series: [incomeStatement.totalRevenue ?? 0, incomeStatement.totalExpense ?? 0],
          chart: {
            type: 'pie',
            height: 160,
            animations: { enabled: true, easing: 'easeout', speed: 600 },
            background: 'transparent',
            toolbar: { show: false },
            foreColor: '#ffffff'
          },
          colors: ['#3b82f6', '#ef4444'],
          labels: [revenueLabel, expenseLabel],
          dataLabels: { style: { colors: ['#ffffff'] } },
          legend: { labels: { colors: '#ffffff' } },
          title: { style: { color: '#ffffff' } },
          tooltip: { style: { fontSize: '14px' } }
        };
 
        project.balanceChart = {
          series: [
            { name: this.i18n.instant('AMOUNT') || 'Amount', data: [totalDebit, totalCredit] }
          ],
          chart: {
            type: 'bar',
            height: 140,
            animations: { enabled: true, easing: 'easeout', speed: 600 },
            background: 'transparent',
            toolbar: { show: false },
            foreColor: '#ffffff'
          },
          xaxis: { categories: [debitLabel, creditLabel], labels: { style: { colors: ['#ffffff'] } } },
          yaxis: { labels: { style: { colors: ['#ffffff'] } } },
          plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
          dataLabels: { style: { colors: ['#ffffff'] } },
          labels: [debitLabel, creditLabel],
          title: { style: { color: '#ffffff' } },
          legend: { labels: { colors: '#ffffff' } },
          tooltip: { style: { fontSize: '14px' } }
        };
      });
 
      // ===== Global Charts Labels =====
      const revenueLabel = this.i18n.instant('REVENUE');
      const expenseLabel = this.i18n.instant('EXPENSE');
      const totalRevenueLabel = this.i18n.instant('TOTAL_REVENUE');
      const totalExpensesLabel = this.i18n.instant('TOTAL_EXPENSES');
      const allProjectsLabel = this.i18n.instant('ALL_PROJECTS');
 
      // ===== Global Charts =====
      this.globalBarChart = {
        series: [
          { name: revenueLabel, data: [this.totalRevenue] },
          { name: expenseLabel, data: [this.totalExpenses] }
        ],
        chart: {
          type: 'bar',
          height: 220,
          animations: { enabled: true, easing: 'easeout', speed: 700 },
          background: 'transparent',
          toolbar: { show: false },
          foreColor: '#ffffff'
        },
        xaxis: { categories: [allProjectsLabel] },
        plotOptions: { bar: { horizontal: false, columnWidth: '45%' } },
        labels: [revenueLabel, expenseLabel]
      };
 
      this.globalPieChart = {
        series: [this.totalRevenue, this.totalExpenses],
        chart: {
          type: 'pie',
          height: 240,
          animations: { enabled: true, easing: 'easeout', speed: 700 },
          background: 'transparent',
          toolbar: { show: false },
          foreColor: '#ffffff'
        },
        labels: [totalRevenueLabel, totalExpensesLabel],
        dataLabels: { style: { colors: ['#ffffff'] } },
        legend: { labels: { colors: '#ffffff' } },
        title: { style: { color: '#ffffff' } },
        tooltip: { style: { fontSize: '14px' } }
      };
 
      this.globalTrendChart = {
        series: [
          { name: revenueLabel, data: results.map(r => r.reports?.incomeStatement?.totalRevenue ?? 0) },
          { name: expenseLabel, data: results.map(r => r.reports?.incomeStatement?.totalExpense ?? 0) }
        ],
        chart: {
          type: 'line',
          height: 200,
          animations: { enabled: true, easing: 'easeout', speed: 700 },
          background: 'transparent',
          toolbar: { show: false },
          foreColor: '#ffffff'
        },
        xaxis: { categories: this.projects.map(p => p.name), labels: { style: { colors: ['#ffffff'] } } },
        yaxis: { labels: { style: { colors: ['#ffffff'] } } },
        dataLabels: { style: { colors: ['#ffffff'] } },
        legend: { labels: { colors: '#ffffff' } },
        title: { style: { color: '#ffffff' } },
        tooltip: { style: { fontSize: '14px' } }
      };
 
      // Compute net profit
      this.totalNetProfit = this.totalRevenue - this.totalExpenses;
    },
    err => {
      console.error('Error loading projects:', err);
      this.loadingProjects = false;
      this.errorProjects = true;
    }
  );
}*/