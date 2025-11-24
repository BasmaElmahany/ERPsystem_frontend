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
import { CommonModule, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { TranslatePipe } from '../../../Shared/Pipes/translate.pipe';

import {
  NgApexchartsModule
} from 'ng-apexcharts';



@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, CurrencyPipe, NgApexchartsModule, TranslatePipe],
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
    barChart: { series: [], chart: { type: 'bar' }, xaxis: { categories: [] }, labels: [], plotOptions: {} },
    pieChart: { series: [], chart: { type: 'pie' }, labels: [] },
    balanceChart: { series: [], chart: { type: 'bar' }, xaxis: { categories: [] }, plotOptions: {}, labels: [] },
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
  constructor(
    private projectService: ProjectService,
    private homeService: HomeService
  ) { }

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
            project.barChart = {
              series: [
                { name: 'Revenue', data: [incomeStatement.totalRevenue ?? 0] },
                { name: 'Expense', data: [incomeStatement.totalExpense ?? 0] }
              ],
              chart: { type: 'bar', height: 160, animations: { enabled: true, easing: 'easeout', speed: 600 } },
              xaxis: { categories: [''] },
              plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
              labels: ['Revenue', 'Expense']
            };

            project.pieChart = {
              series: [incomeStatement.totalRevenue ?? 0, incomeStatement.totalExpense ?? 0],
              chart: { type: 'pie', height: 160, animations: { enabled: true, easing: 'easeout', speed: 600 } },
              labels: ['Revenue', 'Expense']
            };

            project.balanceChart = {
              series: [{ name: 'Amount', data: [totalDebit, totalCredit] }],
              chart: { type: 'bar', height: 140, animations: { enabled: true, easing: 'easeout', speed: 600 } },
              xaxis: { categories: ['Debit', 'Credit'] },
              plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
              labels: ['Debit', 'Credit']
            };
          } else {
            project.errorReports = true;
          }
        });

        // ===== Global Charts =====
        this.globalBarChart = {
          series: [
            { name: 'Revenue', data: [this.totalRevenue] },
            { name: 'Expense', data: [this.totalExpenses] }
          ],
          chart: { type: 'bar', height: 220, animations: { enabled: true, easing: 'easeout', speed: 700 } },
          xaxis: { categories: ['All Projects'] }, // make sure this is defined
          plotOptions: { bar: { horizontal: false, columnWidth: '45%' } }, // define plotOptions
          labels: ['Revenue', 'Expense'] // define labels
        };

        this.globalPieChart = {
          series: [this.totalRevenue, this.totalExpenses],
          chart: { type: 'pie', height: 240, animations: { enabled: true, easing: 'easeout', speed: 700 } },
          labels: ['Total Revenue', 'Total Expenses']
        };

        this.globalTrendChart = {
          series: [
            { name: 'Revenue', data: results.map(r => r.reports?.incomeStatement?.totalRevenue ?? 0) },
            { name: 'Expense', data: results.map(r => r.reports?.incomeStatement?.totalExpense ?? 0) }
          ],
          chart: { type: 'line', height: 200, animations: { enabled: true, easing: 'easeout', speed: 700 } },
          xaxis: { categories: this.projects.map(p => p.name) }, // must exist
          plotOptions: {}, // provide empty object
          labels: [] // optional for line chart, can be empty
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

  fetchProjectReports(projectName: string): Observable<{
    incomeStatement: IncomeStatment,
    balanceSheet: BalanceSheet[],
    trialBalance: trialbalance[]
  }> {
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

}


