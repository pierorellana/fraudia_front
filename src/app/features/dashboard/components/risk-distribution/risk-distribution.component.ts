import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskDistributionItem } from '../../models/dashboard.model';
import { AppCardComponent } from '../../../../shared/components/card/app-card.component';
import { RiskBadgeComponent } from '../../../../shared/components/risk-badge/risk-badge.component';

@Component({
  selector: 'app-risk-distribution',
  standalone: true,
  imports: [CommonModule, AppCardComponent, RiskBadgeComponent],
  template: `
    <app-card title="Distribución de riesgo" eyebrow="Mapa de severidad">
      <div class="risk-bars" *ngIf="items.length > 0; else emptyDistribution">
        <div *ngFor="let item of items" class="risk-bars__item">
          <div>
            <app-risk-badge [level]="item.level"></app-risk-badge>
            <span>{{ item.count }} casos</span>
          </div>
          <div class="risk-bars__track">
            <span [class]="'risk-bars__fill risk-bars__fill--' + item.level" [style.width.%]="item.percentage"></span>
          </div>
          <strong>{{ item.percentage }}%</strong>
        </div>
      </div>
      <ng-template #emptyDistribution>
        <p class="muted-text">Carga un dataset para comenzar el análisis.</p>
      </ng-template>
    </app-card>
  `,
})
export class RiskDistributionComponent {
  @Input() items: RiskDistributionItem[] = [];
}
