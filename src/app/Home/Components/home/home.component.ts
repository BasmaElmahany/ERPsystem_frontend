import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { I18nService, Language } from '../../../Shared/Services/i18n.service';
import en from '../../../Shared/JsonFiles/en.json';
import ar from '../../../Shared/JsonFiles/ar.json';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../Shared/Pipes/translate.pipe';
import {NavItem , DashboardCard  ,Employee} from '../../Models/home'
import { SidebarComponent } from '../sidebar/sidebar.component';
const translations: Record<Language, any> = { en, ar };
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe,SidebarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent implements OnInit, OnDestroy {
  isSidebarOpen = true;
  currentLang$: Observable<Language>;
  isRTL$: Observable<boolean>;

  sortKey: keyof Employee = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  navItems: NavItem[] = [
   // { icon: 'dashboard', key: 'MENU_DASHBOARD', route: '/dashboard' },
    { icon: 'people', key: 'MENU_EMPLOYEES', route: '/projects' },
   // { icon: 'inventory', key: 'MENU_INVENTORY', route: '/inventory' },
   // { icon: 'analytics', key: 'MENU_ANALYTICS', route: '/analytics' },
    //{ icon: 'settings', key: 'MENU_SETTINGS', route: '/settings' },
  ];
/*
  dashboardCards: DashboardCard[] = [
    { key: 'CARD_TOTAL_EMPLOYEES', value: '1,250', icon: 'people', color: '#00e676', change: '+5% since last month' },
    { key: 'CARD_OPEN_PROJECTS', value: '45', icon: 'folder', color: '#29b6f6', change: '-2% since last month' },
    { key: 'CARD_REVENUE_Q3', value: '$1.2M', icon: 'attach_money', color: '#ff9800', change: '+12% since last quarter' },
    { key: 'CARD_SUPPORT_TICKETS', value: '12', icon: 'support_agent', color: '#ef5350', change: 'New Low' },
  ];

  recentActivities: Activity[] = [
    { timeKey: 'TIME_MINS_AGO', descriptionKey: 'ACTIVITY_PAYROLL_APPROVED' },
    { timeKey: 'TIME_HOUR_AGO', descriptionKey: 'ACTIVITY_PROJECT_STARTED' },
    { timeKey: 'TIME_HOURS_AGO', descriptionKey: 'ACTIVITY_INVENTORY_LOW' },
    { timeKey: 'TIME_YESTERDAY', descriptionKey: 'ACTIVITY_REPORT_COMPLETED' },
  ];

  employees: Employee[] = [
    { id: 101, name: 'Alice Johnson', title: 'Software Engineer', department: 'Engineering', status: 'Active', email: 'alice@corp.com' },
    { id: 102, name: 'Bob Smith', title: 'Financial Analyst', department: 'Finance', status: 'On Leave', email: 'bob@corp.com' },
    { id: 103, name: 'Charlie Brown', title: 'HR Manager', department: 'Human Resources', status: 'Active', email: 'charlie@corp.com' },
    { id: 104, name: 'Diana Prince', title: 'Marketing Specialist', department: 'Marketing', status: 'Active', email: 'diana@corp.com' },
    { id: 105, name: 'Eve Adams', title: 'Data Scientist', department: 'Engineering', status: 'Terminated', email: 'eve@corp.com' },
  ];*/

  constructor(private i18nService: I18nService) {
    this.currentLang$ = this.i18nService.currentLang$;
    this.isRTL$ = this.i18nService.currentLang$.pipe(map(lang => lang === 'ar'));
  }

  ngOnInit(): void {
  //  this.sortData('id');
  }

  ngOnDestroy(): void {}

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleLanguage(): void {
    this.i18nService.toggleLanguage();
  }

  getTranslatedChange(change: string): Observable<string> {
    const parts = change.split(' ');
    const value = parts[0];
    let key = '';

    if (change.includes('since last month')) key = 'CHANGE_SINCE_LAST_MONTH';
    else if (change.includes('since last quarter')) key = 'CHANGE_SINCE_LAST_QUARTER';
    else if (change.includes('New Low')) {
      key = 'CHANGE_NEW_LOW';
      return this.i18nService.currentLang$.pipe(
        map(() => translations[this.i18nService.currentLang].CHANGE_NEW_LOW)
      );
    }

    return this.i18nService.currentLang$.pipe(
      map(lang => `${value} ${translations[lang][key]}`)
    );
  }
/*
  sortData(key: keyof Employee): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }

    this.employees.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }
*/
  getStatusClass(status: Employee['status']): string {
    switch (status) {
      case 'Active': return 'status-active';
      case 'On Leave': return 'status-on-leave';
      case 'Terminated': return 'status-terminated';
      default: return '';
    }
  }
}