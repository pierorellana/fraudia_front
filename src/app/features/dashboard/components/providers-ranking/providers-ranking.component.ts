import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCardComponent } from '../../../../shared/components/card/app-card.component';
import { AppBadgeComponent } from '../../../../shared/components/badge/app-badge.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { ProviderRankingItem } from '../../models/dashboard.model';

@Component({
  selector: 'app-providers-ranking',
  standalone: true,
  imports: [CommonModule, AppCardComponent, AppBadgeComponent, CurrencyFormatPipe],
  template: `
    <app-card title="Ranking de proveedores" eyebrow="Concentración de riesgo">
      <div class="rank-list" *ngIf="items.length > 0; else emptyProviders">
        <div *ngFor="let provider of items; index as index" class="rank-list__item">
          <span class="rank-list__index">{{ index + 1 }}</span>
          <div>
            <strong>{{ provider.providerName }}</strong>
            <span>{{ provider.providerType }} · {{ provider.totalClaims }} siniestros</span>
          </div>
          <div class="rank-list__score">
            <app-badge
              [label]="provider.isRestricted ? 'Restringido' : 'Activo'"
              [variant]="provider.isRestricted ? 'danger' : 'success'"
            ></app-badge>
            <strong>{{ provider.averageScore }}</strong>
            <span>{{ provider.totalClaimedAmount | currencyFormat }}</span>
          </div>
        </div>
      </div>
      <ng-template #emptyProviders>
        <p class="muted-text">No hay información disponible.</p>
      </ng-template>
    </app-card>
  `,
})
export class ProvidersRankingComponent {
  @Input() items: ProviderRankingItem[] = [];
}
