import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { ExecutiveSummary } from '../../models/report.model';

@Component({
  selector: 'app-executive-summary',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe, DateFormatPipe],
  template: `
    <section class="executive-summary" *ngIf="summary">
      <header>
        <h2>{{ summary.title }}</h2>
        <span>{{ summary.period.from | dateFormat }} - {{ summary.period.to | dateFormat }}</span>
      </header>
      <div class="metric-grid metric-grid--compact">
        <article class="metric-card"><span>Total</span><strong>{{ summary.metrics.totalClaims }}</strong></article>
        <article class="metric-card metric-card--red"><span>Rojos</span><strong>{{ summary.metrics.redCases }}</strong></article>
        <article class="metric-card metric-card--yellow"><span>Amarillos</span><strong>{{ summary.metrics.yellowCases }}</strong></article>
        <article class="metric-card metric-card--blue"><span>Monto en riesgo</span><strong>{{ summary.metrics.highRiskAmount | currencyFormat }}</strong></article>
      </div>
      <p>{{ summary.summary }}</p>
      <ul>
        <li *ngFor="let recommendation of summary.recommendations">{{ recommendation }}</li>
      </ul>
    </section>
  `,
})
export class ExecutiveSummaryComponent {
  @Input() summary: ExecutiveSummary | null = null;
}
