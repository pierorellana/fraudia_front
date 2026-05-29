import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';
import { ChatWidgetComponent } from '../../../shared/components/chat-widget/chat-widget.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, MobileNavComponent, ChatWidgetComponent],
  template: `
    <div class="app-shell" [class.app-shell--sidebar-collapsed]="sidebarCollapsed()">

      <aside class="app-sidebar-shell" [class.is-open]="mobileSidebarOpen()">
        <app-sidebar
          [collapsed]="sidebarCollapsed()"
          (toggleCollapsed)="toggleSidebarCollapsed()"
          (navigate)="closeMobileSidebar()"
        ></app-sidebar>
      </aside>

      <div *ngIf="mobileSidebarOpen()" class="sidebar-backdrop" (click)="closeMobileSidebar()"></div>

      <div class="app-content-shell">
        <app-topbar (toggleSidebar)="toggleMobileSidebar()"></app-topbar>
        <main class="app-main">
          <router-outlet></router-outlet>
        </main>
      </div>

      <div class="mobile-nav-shell">
        <app-mobile-nav></app-mobile-nav>
      </div>

      <app-chat-widget></app-chat-widget>
    </div>
  `,
})
export class MainLayoutComponent {
  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false);

  toggleSidebarCollapsed(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update((v) => !v);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }
}
