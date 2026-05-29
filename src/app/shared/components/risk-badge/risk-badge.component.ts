import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskLevel } from '../../../core/models/common.model';
import { getRiskLabel, normalizeRiskLevel } from '../../utils/risk.util';

@Component({
  selector: 'app-risk-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="risk-badge" [ngClass]="'risk-badge--' + normalizedLevel">
      {{ label }}
    </span>
  `,
})
export class RiskBadgeComponent {
  @Input() level: RiskLevel | string | null | undefined = 'verde';

  get normalizedLevel(): RiskLevel {
    return normalizeRiskLevel(this.level);
  }

  get label(): string {
    return getRiskLabel(this.normalizedLevel);
  }
}
