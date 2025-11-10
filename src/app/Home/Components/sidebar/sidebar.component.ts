import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavItem } from '../../Models/home';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../Shared/Pipes/translate.pipe';
import { I18nService } from '../../../Shared/Services/i18n.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() isOpen = true;
  @Input() navItems: NavItem[] = [];
  @Output() languageToggle = new EventEmitter<void>();
  @Output() sidebarToggle = new EventEmitter<void>();

  currentLang$: Observable<string>;
  isRTL$: Observable<boolean>;

  constructor(private i18nService: I18nService) {
    this.currentLang$ = this.i18nService.currentLang$;
    this.isRTL$ = this.i18nService.currentLang$.pipe(
      map(lang => lang === 'ar')
    );
  }

  toggleLanguage(): void {
    this.languageToggle.emit();
  }

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  logout(): void {
    // Implement logout logic here
    console.log('Logging out...');
  }
}
