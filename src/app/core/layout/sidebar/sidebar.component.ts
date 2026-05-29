import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { APP_ROUTES } from '../../constants/app-routes';

interface NavItem {
  label: string;
  route: string;
  icon: SafeHtml;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="sidebar" [class.sidebar--collapsed]="collapsed">

      <button
        class="sidebar__toggle-btn"
        type="button"
        (click)="toggleCollapsed.emit()"
        [attr.aria-label]="collapsed ? 'Expandir menú' : 'Contraer menú'"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <polyline [attr.points]="collapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'"></polyline>
        </svg>
      </button>

      <div class="sidebar__header">
        <div class="brand-mark" aria-hidden="true">AI</div>
        <div class="sidebar__brand-info" *ngIf="!collapsed">
          <strong>Fraudia AI</strong>
          <span>Riesgo de siniestros</span>
        </div>
      </div>

      <div class="sidebar__section">
        <p class="sidebar__section-label" *ngIf="!collapsed">MAIN</p>
        <a
          *ngFor="let item of navItems"
          [routerLink]="item.route"
          routerLinkActive="is-active"
          [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
          class="sidebar-link"
          [attr.title]="collapsed ? item.label : null"
          (click)="onNavigate()"
        >
          <span class="sidebar-link__icon" [innerHTML]="item.icon"></span>
          <span class="sidebar-link__label" *ngIf="!collapsed">{{ item.label }}</span>
        </a>
      </div>

      <div class="sidebar__footer" *ngIf="!collapsed">
        <span>Demo MVP</span>
        <strong>v1.0.0</strong>
      </div>

    </nav>
  `,
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() navigate = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  navItems: NavItem[];

  constructor(private sanitizer: DomSanitizer) {
    this.navItems = [
      {
        label: 'Dashboard',
        route: APP_ROUTES.dashboard,
        icon: this.svg(`<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`),
      },
      {
        label: 'Cargar dataset',
        route: APP_ROUTES.uploads,
        icon: this.svg(`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>`),
      },
      {
        label: 'Siniestros',
        route: APP_ROUTES.claims,
        icon: this.svg(`<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>`),
      },
      {
        label: 'Reglas',
        route: APP_ROUTES.rules,
        icon: this.svg(`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`),
      },
      {
        label: 'Reportes',
        route: APP_ROUTES.reports,
        icon: this.svg(`<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`),
      },
    ];
  }

  private svg(paths: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`,
    );
  }

  onNavigate(): void {
    this.navigate.emit();
  }
}
