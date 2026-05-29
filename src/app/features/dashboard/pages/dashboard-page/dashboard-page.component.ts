import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardViewModel } from '../../models/dashboard.model';
import { RiskLevel } from '../../../../core/models/common.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { NotificationService } from '../../../../core/services/notification.service';
import { APP_ROUTES } from '../../../../core/constants/app-routes';
import { formatCurrencyValue, formatDateValue, formatNumberValue } from '../../../../shared/utils/format.util';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyFormatPipe],
  template: `
    <section class="dash-page">


      <ng-container *ngIf="!loading() && view() as v">

        <!-- Hero -->
        <div class="dash-hero">
          <div>
            <h1 class="dash-hero__title">Detector de Fraudes en Siniestros</h1>
            <p class="dash-hero__sub">Análisis inteligente · {{ v.summary.totalClaims }} casos cargados · {{ currentMonth }}</p>
          </div>
          <div class="dash-hero__actions">
            <button class="dash-btn dash-btn--pdf" type="button" [disabled]="generatingReport()" (click)="generateAuditReport()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              {{ generatingReport() ? 'Generando...' : 'Reporte PDF' }}
            </button>
          </div>
        </div>

        <!-- 4 Metric cards -->
        <div class="dash-metrics">
          <div class="dash-metric">
            <div class="dash-metric__icon dash-metric__icon--red">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <span class="dash-metric__arrow">↗</span>
            <strong>{{ v.summary.redClaims }}</strong>
            <p>Casos alto riesgo</p>
            <small>{{ v.summary.yellowClaims }} de riesgo medio</small>
          </div>

          <div class="dash-metric">
            <div class="dash-metric__icon dash-metric__icon--blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <span class="dash-metric__arrow">↗</span>
            <strong>{{ v.summary.totalClaims }}</strong>
            <p>Casos en bandeja</p>
            <small>activos este mes</small>
          </div>

          <div class="dash-metric">
            <div class="dash-metric__icon dash-metric__icon--orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <span class="dash-metric__arrow">↗</span>
            <strong>{{ totalAmountFormatted }}</strong>
            <p>Exposición total</p>
            <small>monto bajo análisis</small>
          </div>

          <div class="dash-metric">
            <div class="dash-metric__icon dash-metric__icon--purple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <span class="dash-metric__arrow">↗</span>
            <strong>{{ v.summary.averageScore }}/100</strong>
            <p>Score promedio IA</p>
            <small>índice de riesgo</small>
          </div>
        </div>

        <!-- Tabs -->
        <div class="dash-tabs">
          <button class="dash-tab" [class.is-active]="activeTab() === 'bandeja'" (click)="switchTab('bandeja')">
            Bandeja de casos sospechosos
          </button>
          <button class="dash-tab" [class.is-active]="activeTab() === 'analisis'" (click)="switchTab('analisis')">
            Análisis &amp; Gráficas
          </button>
        </div>

        <!-- ── Tab: Bandeja ── -->
        <div *ngIf="activeTab() === 'bandeja'">
          <div class="dash-toolbar">
            <label class="dash-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" placeholder="Buscar por código, ramo, cobertura..." (input)="setSearch($event)" />
            </label>
            <div class="dash-chips">
              <button class="dash-chip" [class.is-active]="riskFilter() === ''" (click)="setRiskFilter('')">Todos</button>
              <button class="dash-chip dash-chip--red" [class.is-active]="riskFilter() === 'rojo'" (click)="setRiskFilter('rojo')">Alto riesgo</button>
              <button class="dash-chip dash-chip--yellow" [class.is-active]="riskFilter() === 'amarillo'" (click)="setRiskFilter('amarillo')">Medio riesgo</button>
              <button class="dash-chip dash-chip--green" [class.is-active]="riskFilter() === 'verde'" (click)="setRiskFilter('verde')">Bajo riesgo</button>
            </div>
            <div class="dash-toolbar__right">
              <span class="dash-count">{{ claimsLoading() ? 'Cargando...' : filteredClaims().length + ' casos' }}</span>
            </div>
          </div>

          <div class="dash-table-wrap">
            <table class="dash-table">
              <thead>
                <tr>
                  <th>Código / Ramo</th>
                  <th>Cobertura</th>
                  <th>Monto</th>
                  <th>Score IA ↓</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let claim of filteredClaims()">
                  <td>
                    <strong>{{ claim.id }}</strong>
                    <span>{{ claim.branch }}</span>
                  </td>
                  <td class="dash-td--muted">{{ claim.coverage }}</td>
                  <td class="dash-td--amount">{{ claim.claimedAmount | currencyFormat }}</td>
                  <td>
                    <div class="score-bar-wrap">
                      <div class="score-bar">
                        <div class="score-bar__fill"
                             [class]="'score-bar__fill--' + claim.riskLevel"
                             [style.width.%]="claim.finalScore">
                        </div>
                      </div>
                      <span [style.color]="scoreColor(claim.finalScore)" class="score-num">
                        {{ claim.finalScore }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span class="dash-risk-badge" [class]="'dash-risk-badge--' + claim.riskLevel">
                      ● {{ riskLabel(claim.riskLevel) }}
                    </span>
                  </td>
                  <td>
                    <a [routerLink]="APP_ROUTES.claimDetail(claim.id)" class="dash-action-btn" title="Ver detalle">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
            <p class="dash-empty" *ngIf="filteredClaims().length === 0">
              No hay casos que coincidan con los filtros aplicados.
            </p>
          </div>
        </div>

        <!-- ── Tab: Análisis ── -->
        <ng-container *ngIf="activeTab() === 'analisis'">
          <div class="dash-charts-row">

            <!-- Bar chart: ramo -->
            <div class="dash-chart-card">
              <h3>Casos por ramo</h3>
              <p>Distribución por línea de seguro</p>
              <div class="branch-bars" *ngIf="v.branchRisk.length > 0; else noBranch">
                <div *ngFor="let b of v.branchRisk" class="branch-bar-item">
                  <span class="branch-bar-label">{{ b.branch }}</span>
                  <div class="branch-bar-track">
                    <div class="branch-bar-fill" [style.width.%]="(b.totalClaims / maxBranchClaims()) * 100"></div>
                  </div>
                  <span class="branch-bar-count">{{ b.totalClaims }}</span>
                </div>
              </div>
              <ng-template #noBranch>
                <p class="dash-no-data">Sin datos de ramo disponibles.</p>
              </ng-template>
            </div>

            <!-- Donut chart: distribución por nivel -->
            <div class="dash-chart-card">
              <h3>Distribución por nivel de riesgo</h3>
              <p>Casos con riesgo alto o medio</p>
              <div class="donut-wrap" *ngIf="v.riskDistribution.length > 0; else noDist">
                <div class="donut" [style.background]="donutGradient()">
                  <div class="donut__hole"></div>
                </div>
                <div class="donut-legend">
                  <div *ngFor="let item of v.riskDistribution" class="donut-legend__item">
                    <span class="donut-dot" [style.background]="donutColor(item.level)"></span>
                    <span class="donut-legend__label">{{ riskLabel(item.level) }}</span>
                    <span class="donut-legend__count">{{ item.count }}</span>
                  </div>
                </div>
              </div>
              <ng-template #noDist>
                <p class="dash-no-data">Sin datos de distribución.</p>
              </ng-template>
            </div>

          </div>

          <!-- Alert indicators -->
          <div class="dash-chart-card" *ngIf="v.alertRanking.length > 0">
            <h3>Indicadores más frecuentes detectados por IA</h3>
            <p>Frecuencia de aparición en todos los casos del período</p>
            <div class="indicators-grid">
              <div *ngFor="let alert of v.alertRanking; let i = index" class="indicator-row">
                <span class="indicator-num">{{ i + 1 }}</span>
                <div class="indicator-body">
                  <span class="indicator-title">{{ alert.title }}</span>
                  <div class="indicator-track">
                    <div class="indicator-fill" [style.width.%]="(alert.occurrences / maxOccurrences()) * 100"></div>
                  </div>
                </div>
                <span class="indicator-count">{{ alert.occurrences }} casos</span>
              </div>
            </div>
          </div>
        </ng-container>

      </ng-container>

      <!-- Empty state -->
      <div *ngIf="!loading() && !view()" class="dash-empty-state">
        <p>Carga un dataset para comenzar el análisis.</p>
      </div>

    </section>
  `,
})
export class DashboardPageComponent implements OnInit {
  loading = signal(true);
  view = signal<DashboardViewModel | null>(null);
  activeTab = signal<'bandeja' | 'analisis'>('bandeja');
  searchQuery = signal('');
  riskFilter = signal<RiskLevel | ''>('');
  claimsLoading = signal(false);
  generatingReport = signal(false);
  analyticsLoaded = signal(false);

  readonly APP_ROUTES = APP_ROUTES;

  filteredClaims = computed(() => {
    let items = this.view()?.topRiskClaims ?? [];
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      items = items.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.branch.toLowerCase().includes(q) ||
          c.coverage.toLowerCase().includes(q),
      );
    }
    return items;
  });

  donutGradient = computed(() => {
    const dist = this.view()?.riskDistribution ?? [];
    if (!dist.length) return 'conic-gradient(from -90deg, #1e293b 0% 100%)';
    const colors: Record<string, string> = { rojo: '#e24b4a', critico: '#d85a30', amarillo: '#8a7517', verde: '#1d9e75' };
    let pct = 0;
    const stops = dist.map((item) => {
      const c = colors[item.level] ?? '#6b7280';
      const s = pct;
      pct += item.percentage;
      return `${c} ${s.toFixed(1)}% ${pct.toFixed(1)}%`;
    });
    return `conic-gradient(from -90deg, ${stops.join(', ')})`;
  });

  maxBranchClaims = computed(() => Math.max(...(this.view()?.branchRisk ?? []).map((b) => b.totalClaims), 1));

  maxOccurrences = computed(() => Math.max(...(this.view()?.alertRanking ?? []).map((a) => a.occurrences), 1));

  donutColor(level: string): string {
    const map: Record<string, string> = { rojo: '#e24b4a', critico: '#d85a30', amarillo: '#f59e0b', verde: '#1d9e75' };
    return map[level] ?? '#6b7280';
  }

  get currentMonth(): string {
    return new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  }

  get totalAmountFormatted(): string {
    const amount = this.view()?.summary.totalClaimedAmount ?? 0;
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(0)}M`;
    if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
    return `$${amount}`;
  }

  constructor(
    private dashboardService: DashboardService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardView().subscribe({
      next: (view) => { this.view.set(view); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  switchTab(tab: 'bandeja' | 'analisis'): void {
    this.activeTab.set(tab);
    if (tab === 'analisis' && !this.analyticsLoaded()) {
      this.dashboardService.getAnalyticsData().subscribe({
        next: (data) => {
          const v = this.view();
          if (v) this.view.set({ ...v, ...data });
          this.analyticsLoaded.set(true);
        },
      });
    }
  }

  setSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
  }

  setRiskFilter(level: RiskLevel | ''): void {
    if (this.riskFilter() === level) {
      return;
    }

    this.riskFilter.set(level);
    this.loadDashboardClaims(level);
  }

  generateAuditReport(): void {
    const currentView = this.view();
    if (!currentView || this.generatingReport()) {
      return;
    }

    const reportWindow = window.open('', '_blank', 'width=1120,height=820');
    if (!reportWindow) {
      this.notificationService.warning('No se pudo abrir el reporte. Revisa si el navegador bloqueó la ventana emergente.');
      return;
    }

    reportWindow.opener = null;
    this.generatingReport.set(true);
    this.writeReportLoading(reportWindow);

    if (this.analyticsLoaded()) {
      this.writeAuditReport(reportWindow, currentView);
      this.generatingReport.set(false);
      return;
    }

    this.dashboardService.getAnalyticsData().subscribe({
      next: (data) => {
        const nextView = {
          ...currentView,
          ...data,
        };
        this.view.set(nextView);
        this.analyticsLoaded.set(true);
        this.writeAuditReport(reportWindow, nextView);
        this.generatingReport.set(false);
      },
      error: () => {
        this.writeAuditReport(reportWindow, currentView);
        this.generatingReport.set(false);
      },
    });
  }

  riskLabel(level: string): string {
    const map: Record<string, string> = { rojo: 'Alto riesgo', critico: 'Crítico', amarillo: 'Medio riesgo', verde: 'Bajo riesgo' };
    return map[level] ?? level;
  }

  scoreColor(score: number): string {
    if (score >= 75) return 'var(--color-red)';
    if (score >= 50) return 'var(--color-orange)';
    return 'var(--color-green)';
  }

  private loadDashboardClaims(level: RiskLevel | ''): void {
    this.claimsLoading.set(true);
    this.dashboardService.getDashboardClaims(level).subscribe({
      next: (claims) => {
        const currentView = this.view();
        if (currentView) {
          this.view.set({
            ...currentView,
            topRiskClaims: claims,
          });
        }
        this.claimsLoading.set(false);
      },
      error: () => this.claimsLoading.set(false),
    });
  }

  private writeReportLoading(reportWindow: Window): void {
    reportWindow.document.open();
    reportWindow.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>Generando reporte de auditoría</title>
          <style>
            body {
              min-height: 100vh;
              display: grid;
              place-items: center;
              margin: 0;
              font-family: Arial, sans-serif;
              color: #102033;
              background: #f5f7fa;
            }
            div {
              padding: 28px 32px;
              border: 1px solid #d8e2ea;
              border-radius: 8px;
              background: #ffffff;
              box-shadow: 0 16px 40px rgba(16, 32, 51, 0.12);
            }
            h1 { margin: 0 0 8px; font-size: 20px; }
            p { margin: 0; color: #64748b; }
          </style>
        </head>
        <body>
          <div>
            <h1>Generando reporte de auditoría</h1>
            <p>Preparando métricas, distribución de riesgo y casos relevantes...</p>
          </div>
        </body>
      </html>
    `);
    reportWindow.document.close();
  }

  private writeAuditReport(reportWindow: Window, reportView: DashboardViewModel): void {
    const generatedAt = new Date();
    const visibleClaims = this.filteredClaims();
    const reportClaims = visibleClaims.length ? visibleClaims : reportView.topRiskClaims;
    const riskFilterLabel = this.riskFilter() ? this.riskLabel(this.riskFilter()) : 'Todos';
    const searchLabel = this.searchQuery().trim() || 'Sin búsqueda aplicada';

    reportWindow.document.open();
    reportWindow.document.write(this.buildAuditReportHtml(reportView, reportClaims, generatedAt, riskFilterLabel, searchLabel));
    reportWindow.document.close();
    reportWindow.focus();
    setTimeout(() => reportWindow.print(), 350);
  }

  private buildAuditReportHtml(
    reportView: DashboardViewModel,
    reportClaims: DashboardViewModel['topRiskClaims'],
    generatedAt: Date,
    riskFilterLabel: string,
    searchLabel: string
  ): string {
    const summary = reportView.summary;
    const distributionRows = reportView.riskDistribution
      .map(
        (item) => `
          <tr>
            <td>${this.escapeHtml(this.riskLabel(item.level))}</td>
            <td>${formatNumberValue(item.count)}</td>
            <td>${formatNumberValue(item.percentage)}%</td>
          </tr>
        `
      )
      .join('');
    const claimRows = reportClaims
      .slice(0, 20)
      .map(
        (claim) => `
          <tr>
            <td><strong>${this.escapeHtml(claim.id)}</strong></td>
            <td>${this.escapeHtml(claim.branch || '-')}</td>
            <td>${this.escapeHtml(claim.coverage || '-')}</td>
            <td>${formatCurrencyValue(claim.claimedAmount)}</td>
            <td>${formatNumberValue(claim.finalScore)}/100</td>
            <td>${this.escapeHtml(this.riskLabel(claim.riskLevel))}</td>
            <td>${this.escapeHtml(claim.mainAlerts.join('; ') || 'Sin alertas principales')}</td>
          </tr>
        `
      )
      .join('');
    const alertRows = reportView.alertRanking
      .slice(0, 10)
      .map(
        (alert, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${this.escapeHtml(alert.code)}</td>
            <td>${this.escapeHtml(alert.title)}</td>
            <td>${formatNumberValue(alert.occurrences)}</td>
            <td>${this.escapeHtml(this.riskLabel(alert.severity))}</td>
          </tr>
        `
      )
      .join('');
    const branchRows = reportView.branchRisk
      .slice(0, 10)
      .map(
        (branch) => `
          <tr>
            <td>${this.escapeHtml(branch.branch)}</td>
            <td>${formatNumberValue(branch.totalClaims)}</td>
          </tr>
        `
      )
      .join('');

    return `
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>Reporte de auditoría Fraudia AI</title>
          ${this.auditReportStyles()}
        </head>
        <body>
          <main class="report">
            <header class="hero">
              <div>
                <p class="eyebrow">Fraudia AI · Auditoría de Siniestros</p>
                <h1>Reporte de auditoría antifraude</h1>
                <p class="muted">Generado el ${this.escapeHtml(formatDateValue(generatedAt, 'long'))} · ${this.escapeHtml(generatedAt.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }))}</p>
              </div>
              <div class="stamp">
                <strong>${formatNumberValue(summary.averageScore)}/100</strong>
                <span>Score promedio IA</span>
              </div>
            </header>

            <section class="section">
              <h2>Resumen ejecutivo</h2>
              <div class="metrics">
                ${this.metricCard('Siniestros cargados', formatNumberValue(summary.totalClaims))}
                ${this.metricCard('Casos evaluados', formatNumberValue(summary.assessedClaims))}
                ${this.metricCard('Alto riesgo', formatNumberValue(summary.redClaims))}
                ${this.metricCard('Riesgo medio', formatNumberValue(summary.yellowClaims))}
                ${this.metricCard('Bajo riesgo', formatNumberValue(summary.greenClaims))}
                ${this.metricCard('Exposición total', formatCurrencyValue(summary.totalClaimedAmount))}
                ${this.metricCard('Monto en alto riesgo', formatCurrencyValue(summary.highRiskAmount))}
                ${this.metricCard('Pendientes', formatNumberValue(summary.pendingClaims))}
              </div>
              <p class="summary-text">
                Se consolidó la información visible del dashboard para apoyar una revisión de auditoría. El reporte prioriza señales de riesgo, distribución de niveles y casos que requieren revisión documentada.
              </p>
            </section>

            <section class="section two-columns">
              <div>
                <h2>Distribución por nivel de riesgo</h2>
                ${this.tableOrEmpty(['Nivel', 'Casos', 'Participación'], distributionRows)}
              </div>
              <div>
                <h2>Casos por ramo</h2>
                ${this.tableOrEmpty(['Ramo', 'Casos'], branchRows)}
              </div>
            </section>

            <section class="section">
              <h2>Bandeja auditada</h2>
              <p class="muted">Filtro de riesgo: ${this.escapeHtml(riskFilterLabel)} · Búsqueda: ${this.escapeHtml(searchLabel)}</p>
              ${this.tableOrEmpty(['Código', 'Ramo', 'Cobertura', 'Monto', 'Score', 'Nivel', 'Alertas principales'], claimRows)}
            </section>

            <section class="section">
              <h2>Indicadores frecuentes</h2>
              ${this.tableOrEmpty(['#', 'Código', 'Indicador', 'Frecuencia', 'Severidad'], alertRows)}
            </section>

            <section class="section">
              <h2>Observaciones para auditoría</h2>
              <ul class="notes">
                <li>Los casos de alto riesgo deben priorizarse para revisión humana documentada antes de aprobar pagos o cierres.</li>
                <li>Las alertas son señales analíticas y no constituyen acusación de fraude.</li>
                <li>Validar soporte documental, recurrencia de asegurado/proveedor y consistencia narrativa en los casos con mayor score.</li>
                <li>Conservar evidencia de la decisión operativa tomada por el analista o supervisor.</li>
              </ul>
            </section>

            <footer>
              Reporte generado desde Fraudia AI. Documento de apoyo para auditoría y supervisión antifraude.
            </footer>
          </main>
        </body>
      </html>
    `;
  }

  private metricCard(label: string, value: string): string {
    return `
      <article class="metric">
        <span>${this.escapeHtml(label)}</span>
        <strong>${this.escapeHtml(value)}</strong>
      </article>
    `;
  }

  private tableOrEmpty(headers: string[], rows: string): string {
    if (!rows.trim()) {
      return '<p class="empty">Sin datos disponibles para esta sección.</p>';
    }

    return `
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${this.escapeHtml(header)}</th>`).join('')}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  private auditReportStyles(): string {
    return `
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          color: #102033;
          background: #eef3f7;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
        }
        .report {
          width: min(1080px, 100%);
          margin: 0 auto;
          padding: 28px;
          background: #ffffff;
        }
        .hero {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 24px;
          border: 1px solid #d8e2ea;
          border-radius: 8px;
          background: #102033;
          color: #ffffff;
        }
        .eyebrow {
          margin: 0 0 8px;
          color: #9ec3df;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        h1, h2, p { margin: 0; }
        h1 { font-size: 26px; line-height: 1.1; }
        h2 {
          margin-bottom: 12px;
          color: #102033;
          font-size: 15px;
        }
        .muted {
          margin-top: 8px;
          color: #64748b;
        }
        .hero .muted { color: #c9d7e4; }
        .stamp {
          min-width: 156px;
          align-self: stretch;
          display: grid;
          place-items: center;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.08);
          text-align: center;
        }
        .stamp strong { display: block; font-size: 24px; }
        .stamp span { color: #c9d7e4; font-size: 11px; }
        .section {
          margin-top: 22px;
          padding: 18px;
          border: 1px solid #d8e2ea;
          border-radius: 8px;
          page-break-inside: avoid;
        }
        .metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .metric {
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          background: #f8fafc;
        }
        .metric span {
          display: block;
          margin-bottom: 8px;
          color: #64748b;
          font-size: 11px;
        }
        .metric strong {
          font-size: 17px;
          color: #102033;
        }
        .summary-text {
          margin-top: 14px;
          color: #334155;
          line-height: 1.5;
        }
        .two-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 8px 9px;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
          vertical-align: top;
        }
        th {
          background: #f1f5f9;
          color: #475569;
          font-size: 10px;
          text-transform: uppercase;
        }
        td { color: #1e293b; }
        .empty {
          padding: 12px;
          border: 1px dashed #cbd5e1;
          border-radius: 7px;
          color: #64748b;
          background: #f8fafc;
        }
        .notes {
          margin: 0;
          padding-left: 18px;
          color: #334155;
          line-height: 1.55;
        }
        footer {
          margin-top: 24px;
          padding-top: 12px;
          border-top: 1px solid #d8e2ea;
          color: #64748b;
          font-size: 11px;
        }
        @media print {
          body { background: #ffffff; }
          .report { width: 100%; padding: 0; }
          .section, .hero { box-shadow: none; }
        }
      </style>
    `;
  }

  private escapeHtml(value: string | number | null | undefined): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
