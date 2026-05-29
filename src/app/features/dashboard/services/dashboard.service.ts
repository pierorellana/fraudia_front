import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { HttpClientService } from '../../../core/services/http-client.service';
import { RiskLevel } from '../../../core/models/common.model';
import { ClaimApiDto, ClaimListApiResponse } from '../../claims/models/claim.model';
import {
  AlertDashboardApiDto,
  AlertRankingApiDto,
  AlertRankingItem,
  DashboardSummary,
  DashboardSummaryApiDto,
  DashboardViewModel,
  ProviderDashboardApiDto,
  ProviderRankingApiDto,
  ProviderRankingItem,
  RiskDistributionItem,
  TopRiskClaim,
  mapAlertRankingFromApi,
  mapBranchRiskFromSummary,
  mapDashboardSummaryFromApi,
  mapProviderRankingFromApi,
  mapRiskDistributionFromApi,
  mapTopRiskClaimFromApi,
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private viewCache$: Observable<DashboardViewModel> | null = null;
  private analyticsCache$: Observable<Pick<DashboardViewModel, 'branchRisk' | 'alertRanking'>> | null = null;

  constructor(private http: HttpClientService) {}

  /**
   * Carga rápida: summary y top claims.
   * Usa getAnalyticsData() de forma lazy cuando el usuario abre el tab Análisis.
   */
  getDashboardView(): Observable<DashboardViewModel> {
    if (!this.viewCache$) {
      this.viewCache$ = forkJoin({
        summaryDto: this.getSummaryDto(),
        topRiskClaims: this.getDashboardClaims(),
      }).pipe(
        map(({ summaryDto, topRiskClaims }) => ({
          summary: mapDashboardSummaryFromApi(summaryDto),
          riskDistribution: mapRiskDistributionFromApi(summaryDto),
          topRiskClaims,
          branchRisk: [],
          alertRanking: [],
        })),
        shareReplay(1),
      );
    }
    return this.viewCache$;
  }

  /**
   * Carga lazy de ramo e indicadores para el tab "Análisis & Gráficas".
   * Resultado cacheado: la segunda visita no hace petición.
   */
  getAnalyticsData(): Observable<Pick<DashboardViewModel, 'branchRisk' | 'alertRanking'>> {
    if (!this.analyticsCache$) {
      this.analyticsCache$ = forkJoin({
        summaryDto: this.getSummaryDto(),
        alertRanking: this.getAlertRanking(),
      }).pipe(
        map(({ summaryDto, alertRanking }) => ({
          branchRisk: mapBranchRiskFromSummary(summaryDto),
          alertRanking,
        })),
        shareReplay(1),
      );
    }
    return this.analyticsCache$;
  }

  /** Invalida ambos cachés para forzar re-fetch en la próxima visita. */
  invalidateCache(): void {
    this.viewCache$ = null;
    this.analyticsCache$ = null;
  }

  getSummary(): Observable<DashboardSummary> {
    return this.getSummaryDto().pipe(map(mapDashboardSummaryFromApi));
  }

  getRiskDistribution(): Observable<RiskDistributionItem[]> {
    return this.getSummaryDto().pipe(map(mapRiskDistributionFromApi));
  }

  getTopRiskClaims(limit = 10): Observable<TopRiskClaim[]> {
    return this.http
      .get<ClaimApiDto[]>(API_ENDPOINTS.risk.topClaims, { limit })
      .pipe(map((claims) => claims.map(mapTopRiskClaimFromApi)));
  }

  getDashboardClaims(riskLevel: RiskLevel | '' = '', limit = 20): Observable<TopRiskClaim[]> {
    const normalizedRiskLevel = riskLevel === 'critico' ? 'rojo' : riskLevel || undefined;
    return this.http
      .get<ClaimListApiResponse>(API_ENDPOINTS.claims.list, {
        limit,
        offset: 0,
        risk_level: normalizedRiskLevel,
        min_score: riskLevel === 'critico' ? 90 : undefined,
      })
      .pipe(
        map((response) =>
          response.items
            .map(mapTopRiskClaimFromApi)
            .sort((left, right) => right.finalScore - left.finalScore)
        )
      );
  }

  getProvidersRanking(limit = 10): Observable<ProviderRankingItem[]> {
    return this.http
      .get<ProviderDashboardApiDto>(API_ENDPOINTS.analytics.providers, { limit })
      .pipe(map((response) => response.items.map((item: ProviderRankingApiDto) => mapProviderRankingFromApi(item))));
  }

  getAlertRanking(limit = 10): Observable<AlertRankingItem[]> {
    return this.http
      .get<AlertDashboardApiDto>(API_ENDPOINTS.analytics.alerts, { limit })
      .pipe(map((response) => response.items.map((item: AlertRankingApiDto) => mapAlertRankingFromApi(item))));
  }

  private getSummaryDto(): Observable<DashboardSummaryApiDto> {
    return this.http.get<DashboardSummaryApiDto>(API_ENDPOINTS.analytics.summary);
  }
}
