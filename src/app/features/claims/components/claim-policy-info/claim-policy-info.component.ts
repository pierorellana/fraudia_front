import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCardComponent } from '../../../../shared/components/card/app-card.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { ClaimDetail } from '../../models/claim.model';

@Component({
  selector: 'app-claim-policy-info',
  standalone: true,
  imports: [CommonModule, AppCardComponent, CurrencyFormatPipe, DateFormatPipe],
  template: `
    <app-card title="Póliza y asegurado" eyebrow="Contexto del contrato">
      <div class="info-grid">
        <div><span>Póliza</span><strong>{{ claim.policy?.id || claim.policyId }}</strong></div>
        <div><span>Vigencia</span><strong>{{ claim.policy?.startDate | dateFormat }} - {{ claim.policy?.endDate | dateFormat }}</strong></div>
        <div><span>Suma asegurada</span><strong>{{ claim.policy?.insuredAmount | currencyFormat }}</strong></div>
        <div><span>Asegurado</span><strong>{{ claim.insured?.id || claim.insuredId }}</strong></div>
        <div><span>Segmento</span><strong>{{ claim.insured?.segment || '-' }}</strong></div>
        <div><span>Ciudad</span><strong>{{ claim.insured?.city || claim.policy?.city || '-' }}</strong></div>
        <div><span>Vehículo</span><strong>{{ claim.vehicle?.plate || claim.vehiclePlate || '-' }}</strong></div>
        <div><span>Historial 12m</span><strong>{{ claim.insured?.claimsLastYear ?? claim.insuredClaimHistory }}</strong></div>
      </div>
    </app-card>
  `,
})
export class ClaimPolicyInfoComponent {
  @Input({ required: true }) claim!: ClaimDetail;
}
