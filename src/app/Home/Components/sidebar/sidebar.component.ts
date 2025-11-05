import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavItem } from '../../Models/home';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../Shared/Pipes/translate.pipe';

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

  toggleLanguage(): void {
    this.languageToggle.emit();
  }
}
