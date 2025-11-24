import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { I18nService, Language } from '../../../Shared/Services/i18n.service';
import en from '../../../Shared/JsonFiles/en.json';
import ar from '../../../Shared/JsonFiles/ar.json';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../Shared/Pipes/translate.pipe';
import { NavItem, DashboardCard, Employee } from '../../Models/home'
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../../Auth/Services/auth.service';
const translations: Record<Language, any> = { en, ar };
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, SidebarComponent],
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

    { icon: 'people', key: 'MENU_EMPLOYEES', route: '/projects' },

  ];
  userName: string | null = null;   


  constructor(private i18nService: I18nService,  private authService: AuthService) {
    this.currentLang$ = this.i18nService.currentLang$;
    this.isRTL$ = this.i18nService.currentLang$.pipe(map(lang => lang === 'ar'));
  }

  ngOnInit(): void {
   const user = this.authService.getUserInfo();
   this.userName =user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User';
  }

  ngOnDestroy(): void { }

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
  
  getStatusClass(status: Employee['status']): string {
    switch (status) {
      case 'Active': return 'status-active';
      case 'On Leave': return 'status-on-leave';
      case 'Terminated': return 'status-terminated';
      default: return '';
    }
  }
}