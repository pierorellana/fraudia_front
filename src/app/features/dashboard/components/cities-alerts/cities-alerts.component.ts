import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCardComponent } from '../../../../shared/components/card/app-card.component';
import { CityAlertItem } from '../../models/dashboard.model';

@Component({
  selector: 'app-cities-alerts',
  standalone: true,
  imports: [CommonModule, AppCardComponent],
  template: `
    <app-card title="Alertas por ciudad" eyebrow="Distribución territorial">
      <div class="city-grid" *ngIf="items.length > 0; else emptyCities">
        <div *ngFor="let item of items" class="city-grid__item">
          <strong>{{ item.city }}</strong>
          <span>{{ item.totalClaims }} siniestros</span>
          <div>
            <small>Rojos</small>
            <b>{{ item.highRiskClaims }}</b>
          </div>
          <div>
            <small>Score</small>
            <b>{{ item.averageScore }}</b>
          </div>
        </div>
      </div>
      <ng-template #emptyCities>
        <p class="muted-text">No hay información disponible.</p>
      </ng-template>
    </app-card>
  `,
})
export class CitiesAlertsComponent {
  @Input() items: CityAlertItem[] = [];
}
