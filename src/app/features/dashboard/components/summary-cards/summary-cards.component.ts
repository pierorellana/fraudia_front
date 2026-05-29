import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardSummary } from '../../models/dashboard.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

interface SummaryMetric {
  label: string;
  value: string | number;
  tone: 'default' | 'green' | 'yellow' | 'red' | 'blue';
}

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  template: `
    <section class="metric-grid">
      <article *ngFor="let metric of metrics" class="metric-card" [ngClass]="'metric-card--' + metric.tone">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
      </article>
      <article class="metric-card metric-card--blue">
        <span>Monto total reclamado</span>
        <strong>{{ summary.totalClaimedAmount | currencyFormat }}</strong>
      </article>
      <article class="metric-card metric-card--red">
        <span>Monto en riesgo rojo</span>
        <strong>{{ summary.highRiskAmount | currencyFormat }}</strong>
      </article>
    </section>
  `,
})
export class SummaryCardsComponent {
  @Input({ required: true }) summary!: DashboardSummary;

  get metrics(): SummaryMetric[] {
    return [
      { label: 'Total de siniestros', value: this.summary.totalClaims, tone: 'default' },
      { label: 'Siniestros evaluados', value: this.summary.assessedClaims, tone: 'blue' },
      { label: 'Siniestros pendientes', value: this.summary.pendingClaims, tone: 'yellow' },
      { label: 'Casos verdes', value: this.summary.greenClaims, tone: 'green' },
      { label: 'Casos amarillos', value: this.summary.yellowClaims, tone: 'yellow' },
      { label: 'Casos rojos', value: this.summary.redClaims, tone: 'red' },
      { label: 'Score promedio', value: `${this.summary.averageScore}/100`, tone: 'blue' },
    ];
  }
}
