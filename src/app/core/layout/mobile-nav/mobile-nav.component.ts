import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from '../../constants/app-routes';

interface MobileNavItem {
  label: string;
  route: string;
  shortcut: string;
}

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="mobile-nav" aria-label="Navegación móvil">
      <a
        *ngFor="let item of navItems"
        [routerLink]="item.route"
        routerLinkActive="is-active"
        class="mobile-nav__link"
      >
        <span aria-hidden="true">{{ item.shortcut }}</span>
        <span class="text-xs">{{ item.label }}</span>
      </a>
    </nav>
  `,
})
export class MobileNavComponent {
  navItems: MobileNavItem[] = [
    { label: 'Panel', route: APP_ROUTES.dashboard, shortcut: 'D' },
    { label: 'Cargar', route: APP_ROUTES.uploads, shortcut: 'U' },
    { label: 'Casos', route: APP_ROUTES.claims, shortcut: 'S' },
    { label: 'Reglas', route: APP_ROUTES.rules, shortcut: 'R' },
    { label: 'Reportes', route: APP_ROUTES.reports, shortcut: 'P' },
  ];
}
