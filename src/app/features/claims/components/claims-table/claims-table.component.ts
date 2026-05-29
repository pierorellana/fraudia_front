import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from '../../../../core/constants/app-routes';
import { AppButtonComponent } from '../../../../shared/components/button/app-button.component';
import { RiskBadgeComponent } from '../../../../shared/components/risk-badge/risk-badge.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { Claim } from '../../models/claim.model';

@Component({
  selector: 'app-claims-table',
  standalone: true,
  imports: [CommonModule, RouterModule, AppButtonComponent, RiskBadgeComponent, CurrencyFormatPipe, DateFormatPipe],
  template: `
    <div class="claims-desktop-table">
      <table>
        <thead>
          <tr>
            <th>Siniestro</th>
            <th>Ramo</th>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Score</th>
            <th>Riesgo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let claim of claims">
            <td><strong>{{ claim.id }}</strong><span>{{ claim.coverage || '-' }}</span></td>
            <td>{{ claim.branch || '-' }}</td>
            <td>{{ claim.occurrenceDate | dateFormat }}</td>
            <td>{{ claim.claimedAmount | currencyFormat }}</td>
            <td><strong>{{ claim.score.finalScore }}</strong></td>
            <td><app-risk-badge [level]="claim.score.level"></app-risk-badge></td>
            <td>
              <div class="table-actions">
                <a [routerLink]="APP_ROUTES.claimDetail(claim.id)">Ver detalle</a>
                <button type="button" (click)="evaluate.emit(claim.id)">Evaluar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="claims-mobile-list">
      <article *ngFor="let claim of claims" class="claim-card">
        <div class="claim-card__header">
          <div>
            <strong>{{ claim.id }}</strong>
            <span>{{ claim.branch || 'Sin ramo' }} · {{ claim.coverage || 'Sin cobertura' }}</span>
          </div>
          <app-risk-badge [level]="claim.score.level"></app-risk-badge>
        </div>
        <div class="claim-card__metrics">
          <div><span>Score</span><strong>{{ claim.score.finalScore }}</strong></div>
          <div><span>Monto</span><strong>{{ claim.claimedAmount | currencyFormat }}</strong></div>
          <div><span>Fecha</span><strong>{{ claim.occurrenceDate | dateFormat }}</strong></div>
        </div>
        <div class="actions-row">
          <a class="text-link" [routerLink]="APP_ROUTES.claimDetail(claim.id)">Ver detalle</a>
          <app-button label="Evaluar" size="sm" variant="secondary" (pressed)="evaluate.emit(claim.id)"></app-button>
        </div>
      </article>
    </div>
  `,
})
export class ClaimsTableComponent {
  @Input() claims: Claim[] = [];
  @Output() evaluate = new EventEmitter<string>();
  readonly APP_ROUTES = APP_ROUTES;
}
