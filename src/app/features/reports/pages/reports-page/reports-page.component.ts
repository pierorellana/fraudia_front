import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppButtonComponent } from '../../../../shared/components/button/app-button.component';
import { AppCardComponent } from '../../../../shared/components/card/app-card.component';
import { CriticalCasesReportComponent } from '../../components/critical-cases-report/critical-cases-report.component';
import { ExecutiveSummaryComponent } from '../../components/executive-summary/executive-summary.component';
import { CriticalCase, ExecutiveSummary } from '../../models/report.model';
import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    CommonModule,
    AppButtonComponent,
    AppCardComponent,
    CriticalCasesReportComponent,
    ExecutiveSummaryComponent,
  ],
  template: `
    <section class="page">
      <ng-container *ngIf="!loading() && summary() as s">
        <header class="page-header">
          <div>
            <p class="page-kicker">Reportería</p>
            <h1>Reportes</h1>
            <span>Casos críticos, resumen ejecutivo y recomendaciones para comité.</span>
          </div>
          <app-button label="Preparar exportación" variant="secondary"></app-button>
        </header>

        <app-card title="Resumen ejecutivo" eyebrow="Vista para dirección">
          <app-executive-summary [summary]="s"></app-executive-summary>
        </app-card>

        <app-card title="Casos críticos" eyebrow="Prioridad de revisión">
          <app-critical-cases-report [cases]="criticalCases()"></app-critical-cases-report>
        </app-card>
      </ng-container>
    </section>
  `,
})
export class ReportsPageComponent implements OnInit {
  loading = signal(true);
  summary = signal<ExecutiveSummary | null>(null);
  criticalCases = signal<CriticalCase[]>([]);

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.reportsService.getExecutiveSummary().subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loadCriticalCases();
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private loadCriticalCases(): void {
    this.reportsService.getCriticalCases().subscribe({
      next: (cases) => {
        this.criticalCases.set(cases);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
