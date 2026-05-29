import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from './core/services/loading.service';
import { AppNotification, NotificationService } from './core/services/notification.service';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoadingSpinnerComponent],
  template: `
    <div class="app-root">
      <router-outlet></router-outlet>

      <div *ngIf="isLoading$ | async" class="global-loading">
        <app-loading-spinner message="Analizando información"></app-loading-spinner>
      </div>

      <div class="notification-stack" aria-live="polite">
        <div
          *ngFor="let notification of notifications()"
          class="notification"
          [ngClass]="'notification--' + notification.type"
        >
          <p>{{ notification.message }}</p>
          <button type="button" (click)="onCloseNotification(notification.id)" aria-label="Cerrar notificación">
            ×
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AppComponent {
  isLoading$;
  notifications = signal<AppNotification[]>([]);

  constructor(
    loadingService: LoadingService,
    private notificationService: NotificationService
  ) {
    this.isLoading$ = loadingService.loading$;
    this.notificationService.notifications$.subscribe((notifications) => {
      this.notifications.set(notifications);
    });
  }

  onCloseNotification(id: string): void {
    this.notificationService.remove(id);
  }
}
