import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from '../../../../core/constants/app-routes';
import { AppCardComponent } from '../../../../shared/components/card/app-card.component';
import { RiskBadgeComponent } from '../../../../shared/components/risk-badge/risk-badge.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { TopRiskClaim } from '../../models/dashboard.model';

@Component({
  selector: 'app-top-risk-claims',
  standalone: true,
  imports: [CommonModule, RouterModule, AppCardComponent, RiskBadgeComponent, CurrencyFormatPipe],
  template: `
    <app-card title="Top 10 siniestros más riesgosos" eyebrow="Prioridad operativa">
      <div class="stack-list" *ngIf="items.length > 0; else emptyTop">
        <a *ngFor="let claim of items" class="stack-list__item" [routerLink]="APP_ROUTES.claimDetail(claim.id)">
          <div>
            <strong>{{ claim.id }}</strong>
            <span>{{ claim.branch }} · {{ claim.coverage }}</span>
          </div>
          <div class="stack-list__meta">
            <app-risk-badge [level]="claim.riskLevel"></app-risk-badge>
            <strong>{{ claim.finalScore }}</strong>
            <span>{{ claim.claimedAmount | currencyFormat }}</span>
          </div>
        </a>
      </div>
      <ng-template #emptyTop>
        <p class="muted-text">No hay información disponible.</p>
      </ng-template>
    </app-card>
  `,
})
export class TopRiskClaimsComponent {
  @Input() items: TopRiskClaim[] = [];
  readonly APP_ROUTES = APP_ROUTES;
}
