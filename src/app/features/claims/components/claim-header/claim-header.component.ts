import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppButtonComponent } from '../../../../shared/components/button/app-button.component';
import { RiskBadgeComponent } from '../../../../shared/components/risk-badge/risk-badge.component';
import { ClaimDetail } from '../../models/claim.model';

@Component({
  selector: 'app-claim-header',
  standalone: true,
  imports: [CommonModule, AppButtonComponent, RiskBadgeComponent],
  template: `
    <header class="detail-header">
      <div>
        <p class="page-kicker">Detalle de siniestro</p>
        <h1>{{ claim.id }}</h1>
        <span>{{ claim.branch || 'Sin ramo' }} · {{ claim.coverage || 'Sin cobertura' }}</span>
      </div>
      <div class="detail-header__actions">
        <app-risk-badge [level]="claim.score.level"></app-risk-badge>
        <app-button label="Evaluar nuevamente" [loading]="evaluating" (pressed)="evaluate.emit()"></app-button>
        <app-button label="Pedir explicación IA" variant="secondary" [loading]="askingAgent" (pressed)="askAgent.emit()"></app-button>
      </div>
    </header>
  `,
})
export class ClaimHeaderComponent {
  @Input({ required: true }) claim!: ClaimDetail;
  @Input() evaluating = false;
  @Input() askingAgent = false;
  @Output() evaluate = new EventEmitter<void>();
  @Output() askAgent = new EventEmitter<void>();
}
