import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../Project/Services/project.service';
import { HomeService } from '../../Services/home.service';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { BalanceSheet, IncomeStatment, ProjectReportResult, ProjectSummary, trialbalance } from '../../Models/home';
import { CommonModule, CurrencyPipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, CurrencyPipe],
  templateUrl: './project-dashboard.component.html',
  styleUrl: './project-dashboard.component.scss'
})
export class ProjectDashboardComponent implements OnInit {

  projects: ProjectSummary[] = [];
  loadingProjects: boolean = true;
  errorProjects: boolean = false;

  totalRevenue: number = 0;
  totalExpenses: number = 0;
  totalNetProfit: number = 0;

  constructor(
    private projectService: ProjectService,
    private homeService: HomeService
  ) {}

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
          isBalanced: false
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

            const totalDebit = trialBalance.reduce(
              (sum: number, tb: trialbalance) => sum + tb.debit,
              0
            );

            const totalCredit = trialBalance.reduce(
              (sum: number, tb: trialbalance) => sum + tb.credit,
              0
            );

            project.isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

            this.totalRevenue += incomeStatement.totalRevenue;
            this.totalExpenses += incomeStatement.totalExpense;
          } else {
            project.errorReports = true;
          }
        });

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
      ? project.incomeStatement.totalRevenue - project.incomeStatement.totalExpense
      : 0;
  }
}
