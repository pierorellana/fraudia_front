import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBadgeComponent } from '../../../../shared/components/badge/app-badge.component';
import { AppCardComponent } from '../../../../shared/components/card/app-card.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { Provider } from '../../models/claim.model';

@Component({
  selector: 'app-claim-provider-info',
  standalone: true,
  imports: [CommonModule, AppBadgeComponent, AppCardComponent, CurrencyFormatPipe],
  template: `
    <app-card title="Proveedor" eyebrow="Taller, clínica o tercero">
      <div class="info-grid" *ngIf="provider; else noProvider">
        <div><span>Código</span><strong>{{ provider.id }}</strong></div>
        <div><span>Nombre</span><strong>{{ provider.name || '-' }}</strong></div>
        <div><span>Tipo</span><strong>{{ provider.providerType || '-' }}</strong></div>
        <div><span>Ciudad</span><strong>{{ provider.city || '-' }}</strong></div>
        <div><span>Reclamos asociados</span><strong>{{ provider.associatedClaims }}</strong></div>
        <div><span>Monto promedio</span><strong>{{ provider.averageAmount | currencyFormat }}</strong></div>
        <div class="info-grid__wide">
          <app-badge
            [label]="provider.isRestricted ? 'Proveedor restringido' : 'Proveedor activo'"
            [variant]="provider.isRestricted ? 'danger' : 'success'"
          ></app-badge>
        </div>
      </div>
      <ng-template #noProvider>
        <p class="muted-text">No hay información disponible.</p>
      </ng-template>
    </app-card>
  `,
})
export class ClaimProviderInfoComponent {
  @Input() provider?: Provider | null;
}
