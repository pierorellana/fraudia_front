import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCardComponent } from '../../../../shared/components/card/app-card.component';
import { RiskBadgeComponent } from '../../../../shared/components/risk-badge/risk-badge.component';
import { ClaimAlert } from '../../models/claim.model';

@Component({
  selector: 'app-claim-alerts-list',
  standalone: true,
  imports: [CommonModule, AppCardComponent, RiskBadgeComponent],
  template: `
    <app-card title="Alertas activadas" eyebrow="Reglas de negocio">
      <div class="alert-list" *ngIf="alerts.length > 0; else noAlerts">
        <article *ngFor="let alert of alerts" class="alert-item">
          <div>
            <strong>{{ alert.code }} · {{ alert.title }}</strong>
            <p>{{ alert.description }}</p>
            <span>{{ alert.recommendation || 'Revisar evidencia del caso.' }}</span>
          </div>
          <div>
            <app-risk-badge [level]="alert.severity"></app-risk-badge>
            <b>+{{ alert.points }}</b>
          </div>
        </article>
      </div>
      <ng-template #noAlerts>
        <p class="muted-text">No hay alertas activadas.</p>
      </ng-template>
    </app-card>
  `,
})
export class ClaimAlertsListComponent {
  @Input() alerts: ClaimAlert[] = [];
}
