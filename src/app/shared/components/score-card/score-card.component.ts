import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskLevel } from '../../../core/models/common.model';
import { RiskBadgeComponent } from '../risk-badge/risk-badge.component';

@Component({
  selector: 'app-score-card',
  standalone: true,
  imports: [CommonModule, RiskBadgeComponent],
  template: `
    <section class="score-card">
      <div class="score-card__header">
        <div>
          <p>Score final</p>
          <strong>{{ finalScore }}</strong>
        </div>
        <app-risk-badge [level]="riskLevel"></app-risk-badge>
      </div>

      <div class="score-card__grid">
        <div>
          <span>Reglas</span>
          <strong>{{ rulesScore }}</strong>
        </div>
        <div>
          <span>IA</span>
          <strong>{{ aiScore }}</strong>
        </div>
        <div>
          <span>NLP</span>
          <strong>{{ nlpScore }}</strong>
        </div>
      </div>

      <div class="score-card__bar" aria-hidden="true">
        <span [style.width.%]="boundedScore"></span>
      </div>

      <p *ngIf="recommendation" class="score-card__recommendation">{{ recommendation }}</p>
    </section>
  `,
})
export class ScoreCardComponent {
  @Input() finalScore = 0;
  @Input() rulesScore = 0;
  @Input() aiScore = 0;
  @Input() nlpScore = 0;
  @Input() riskLevel: RiskLevel | string | null | undefined = 'verde';
  @Input() recommendation = '';

  get boundedScore(): number {
    return Math.max(0, Math.min(100, this.finalScore));
  }
}
