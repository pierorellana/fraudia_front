import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardService } from '../../dashboard/services/dashboard.service';
import { CriticalCase, ExecutiveSummary } from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  constructor(private dashboardService: DashboardService) {}

  getCriticalCases(): Observable<CriticalCase[]> {
    return this.dashboardService.getDashboardView().pipe(
      map((view) =>
        view.topRiskClaims.slice(0, 10).map((claim) => ({
          claimId: claim.id,
          finalScore: claim.finalScore,
          riskLevel: claim.riskLevel,
          claimedAmount: claim.claimedAmount,
          branch: claim.branch,
          mainReasons: claim.mainAlerts.length ? claim.mainAlerts : ['Score elevado frente al umbral de revisión.'],
          recommendation:
            claim.riskLevel === 'rojo' || claim.riskLevel === 'critico'
              ? 'Escalar a revisión antifraude.'
              : 'Revisar documentación de soporte.',
        }))
      )
    );
  }

  getExecutiveSummary(): Observable<ExecutiveSummary> {
    return this.dashboardService.getDashboardView().pipe(
      map((view) => {
        const now = new Date();
        const from = new Date(now);
        from.setDate(now.getDate() - 30);

        return {
          title: 'Resumen ejecutivo de riesgo',
          period: {
            from: from.toISOString(),
            to: now.toISOString(),
          },
          metrics: {
            totalClaims: view.summary.totalClaims,
            redCases: view.summary.redClaims,
            yellowCases: view.summary.yellowClaims,
            highRiskAmount: view.summary.highRiskAmount,
          },
          summary: `Se evaluaron ${view.summary.assessedClaims} siniestros de ${view.summary.totalClaims}. El score promedio es ${view.summary.averageScore}/100 y el monto en riesgo rojo asciende a ${view.summary.highRiskAmount}.`,
          recommendations: [
            'Priorizar los casos rojos con proveedores restringidos o documentación inconsistente.',
            'Validar manualmente narrativas similares antes de tomar una decisión operativa.',
            'Monitorear ramos y sucursales con mayor concentración de alertas.',
          ],
        };
      })
    );
  }
}
