import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../Project/Services/project.service';
import { HomeService } from '../../Services/home.service';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import {
  BalanceSheet,
  IncomeStatment,
  ProjectSummary as BaseProject,
  trialbalance,
  ApexBarChartOptions,
  ProjectSummary,
  ProjectReportResult
} from '../../Models/home';
import { CommonModule, CurrencyPipe, NgFor, NgIf, AsyncPipe } from '@angular/common';
import { TranslatePipe } from '../../../Shared/Pipes/translate.pipe';
import { Router } from '@angular/router';
import { I18nService } from '../../../Shared/Services/i18n.service';

import {
  NgApexchartsModule
} from 'ng-apexcharts';



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
  // language observable for navbar
  currentLang$: any;
  currentLang: any;
  constructor(
    private projectService: ProjectService,
    private homeService: HomeService,
    private router: Router,
    private i18n: I18nService
  ) {
    this.currentLang$ = this.i18n.currentLang$;
  }

  ngOnInit(): void {
    this.loadProjects();
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
        this.totalRevenue = 0;
        this.totalExpenses = 0;
        this.globalTotalDebit = 0;
        this.globalTotalCredit = 0;

        results.forEach(result => {
          const projIndex = this.projects.findIndex(p => p.name === result.project.name);
          if (projIndex === -1) return;

          const project = this.projects[projIndex];
          project.loadingReports = false;

          if (result.reports) {
            const { incomeStatement, balanceSheet, trialBalance } = result.reports;

            project.incomeStatement = incomeStatement;
            project.balanceSheet = balanceSheet;
            project.trialBalance = trialBalance;

            // ===== Trial Balance Check =====
            const totalDebit = trialBalance.reduce((sum, tb) => sum + tb.debit, 0);
            const totalCredit = trialBalance.reduce((sum, tb) => sum + tb.credit, 0);
            project.isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

            // accumulate global totals
            this.totalRevenue += incomeStatement.totalRevenue ?? 0;
            this.totalExpenses += incomeStatement.totalExpense ?? 0;
            this.globalTotalDebit += totalDebit;
            this.globalTotalCredit += totalCredit;

            // ===== Project Charts =====
            // Translate labels dynamically
            const revenueLabel = this.i18n.instant('REVENUE');
            const expenseLabel = this.i18n.instant('EXPENSE');
            const debitLabel = this.i18n.instant('DEBIT');
            const creditLabel = this.i18n.instant('CREDIT');

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
                foreColor: '#ffffff' // sets text color for axes, tooltip, legend
              },
              xaxis: {
                categories: [''],
                labels: { style: { colors: ['#ffffff'] } }
              },
              yaxis: {
                labels: { style: { colors: ['#ffffff'] } }
              },
              plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
              dataLabels: { style: { colors: ['#ffffff'] } },
              labels: [revenueLabel, expenseLabel],
              title: { style: { color: '#ffffff' } },
              legend: { labels: { colors: '#ffffff' } },
              tooltip: {
                style: { fontSize: '14px'/*, color: '#ffffff'*/ }
              }
            };


            project.pieChart = {
              series: [incomeStatement.totalRevenue ?? 0, incomeStatement.totalExpense ?? 0],
              chart: {
                type: 'pie',
                height: 160,
                animations: { enabled: true, easing: 'easeout', speed: 600 },
                background: 'transparent',
                toolbar: { show: false },
                foreColor: '#ffffff' // sets text color for axes, tooltip, legend
              },
              labels: [revenueLabel, expenseLabel],
              dataLabels: { style: { colors: ['#ffffff'] } },
              legend: { labels: { colors: '#ffffff' } },
              title: { style: { color: '#ffffff' } },
              tooltip: { style: { fontSize: '14px'/*, color: '#ffffff'*/ } }
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
                foreColor: '#ffffff' // sets text color for axes, tooltip, legend
              },
              xaxis: {
                categories: [debitLabel, creditLabel],
                labels: { style: { colors: ['#ffffff'] } }
              },
              yaxis: {
                labels: { style: { colors: ['#ffffff'] } }
              },
              plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
              dataLabels: { style: { colors: ['#ffffff'] } },
              labels: [debitLabel, creditLabel],
              title: { style: { color: '#ffffff' } },
              legend: { labels: { colors: '#ffffff' } },
              tooltip: { style: { fontSize: '14px'/*, color: '#ffffff'*/ } }
            };

          } else {
            project.errorReports = true;
          }
        });
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
            type: 'bar', height: 220, animations: { enabled: true, easing: 'easeout', speed: 700 },
            background: 'transparent',
            toolbar: { show: false },
            foreColor: '#ffffff'
          },
          xaxis: { categories: [allProjectsLabel] }, // make sure this is defined
          plotOptions: { bar: { horizontal: false, columnWidth: '45%' } }, // define plotOptions
          labels: [revenueLabel, expenseLabel] // define labels
        };

        this.globalPieChart = {
          series: [this.totalRevenue, this.totalExpenses],
          chart: {
            type: 'pie', height: 240, animations: { enabled: true, easing: 'easeout', speed: 700 },
            background: 'transparent',
            toolbar: { show: false },
            foreColor: '#ffffff'
          },
          labels: [totalRevenueLabel, totalExpensesLabel],
          dataLabels: { style: { colors: ['#ffffff'] } },
          legend: { labels: { colors: '#ffffff' } },
          title: { style: { color: '#ffffff' } },
          tooltip: { style: { fontSize: '14px'/*, color: '#ffffff' */ } }
        };


        this.globalTrendChart = {
          series: [
            { name: revenueLabel, data: results.map(r => r.reports?.incomeStatement?.totalRevenue ?? 0) },
            { name: expenseLabel, data: results.map(r => r.reports?.incomeStatement?.totalExpense ?? 0) }
          ],
          chart: {
            type: 'line', height: 200, animations: { enabled: true, easing: 'easeout', speed: 700 },
            background: 'transparent',
            toolbar: { show: false },
            foreColor: '#ffffff'
          },
          xaxis: {
            categories: this.projects.map(p => p.name),
            labels: { style: { colors: ['#ffffff'] } }
          },
          yaxis: {
            labels: { style: { colors: ['#ffffff'] } }
          },
          dataLabels: { style: { colors: ['#ffffff'] } },
          legend: { labels: { colors: '#ffffff' } },
          title: { style: { color: '#ffffff' } },
          tooltip: { style: { fontSize: '14px'/*, color: '#ffffff' */ } }
        };


        // compute net profit
        this.totalNetProfit = this.totalRevenue - this.totalExpenses;
      },
      err => {
        console.error('Error loading projects:', err);
        this.loadingProjects = false;
        this.errorProjects = true;
      }
    );
  }

  fetchProjectReports(projectName: string): Observable<{ incomeStatement: IncomeStatment, balanceSheet: BalanceSheet[], trialBalance: trialbalance[] }> {
    return forkJoin({
      incomeStatement: this.homeService.getIncomeStatement(projectName),
      balanceSheet: this.homeService.getBalanceSheet(projectName),
      trialBalance: this.homeService.getTrailBalance(projectName)
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

}


