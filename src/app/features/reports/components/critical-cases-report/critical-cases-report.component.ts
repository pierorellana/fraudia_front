import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from '../../../../core/constants/app-routes';
import { RiskBadgeComponent } from '../../../../shared/components/risk-badge/risk-badge.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { CriticalCase } from '../../models/report.model';

@Component({
  selector: 'app-critical-cases-report',
  standalone: true,
  imports: [CommonModule, RouterModule, RiskBadgeComponent, CurrencyFormatPipe],
  template: `
    <div class="critical-list" *ngIf="cases.length > 0; else emptyCases">
      <article *ngFor="let item of cases">
        <div>
          <strong>{{ item.claimId }}</strong>
          <span>{{ item.branch }} · {{ item.claimedAmount | currencyFormat }}</span>
          <p>{{ item.recommendation }}</p>
        </div>
        <div>
          <app-risk-badge [level]="item.riskLevel"></app-risk-badge>
          <b>{{ item.finalScore }}</b>
          <a [routerLink]="APP_ROUTES.claimDetail(item.claimId)">Ver caso</a>
        </div>
      </article>
    </div>
    <ng-template #emptyCases>
      <p class="muted-text">No hay información disponible.</p>
    </ng-template>
  `,
})
export class CriticalCasesReportComponent {
  @Input() cases: CriticalCase[] = [];
  readonly APP_ROUTES = APP_ROUTES;
}
