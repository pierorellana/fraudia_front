import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
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
        summaryDto: this.getSummaryDto().pipe(catchError(() => of(null))),
        topRiskClaims: this.getDashboardClaims().pipe(catchError(() => of([]))),
      }).pipe(
        map(({ summaryDto, topRiskClaims }) => {
          const fallbackSummary = this.buildSummaryFromClaims(topRiskClaims);
          return {
            summary: summaryDto ? mapDashboardSummaryFromApi(summaryDto) : fallbackSummary,
            riskDistribution: summaryDto
              ? mapRiskDistributionFromApi(summaryDto)
              : this.buildRiskDistributionFromClaims(topRiskClaims),
            topRiskClaims,
            branchRisk: [],
            alertRanking: [],
          };
        }),
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
        summaryDto: this.getSummaryDto().pipe(catchError(() => of(null))),
        alertRanking: this.getAlertRanking().pipe(catchError(() => of([]))),
      }).pipe(
        map(({ summaryDto, alertRanking }) => ({
          branchRisk: summaryDto ? mapBranchRiskFromSummary(summaryDto) : [],
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
      .get<ClaimListApiResponse | ClaimApiDto[]>(API_ENDPOINTS.claims.list, {
        limit,
        offset: 0,
        risk_level: normalizedRiskLevel,
        min_score: riskLevel === 'critico' ? 90 : undefined,
      })
      .pipe(
        map((response) =>
          this.resolveClaimItems(response)
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

  private resolveClaimItems(response: ClaimListApiResponse | ClaimApiDto[]): ClaimApiDto[] {
    return Array.isArray(response) ? response : response.items ?? [];
  }

  private buildSummaryFromClaims(claims: TopRiskClaim[]): DashboardSummary {
    const totalClaims = claims.length;
    const averageScore = totalClaims
      ? Math.round(claims.reduce((sum, claim) => sum + claim.finalScore, 0) / totalClaims)
      : 0;
    const highRiskClaims = claims.filter((claim) => claim.riskLevel === 'rojo' || claim.riskLevel === 'critico');

    return {
      totalClaims,
      assessedClaims: totalClaims,
      pendingClaims: 0,
      greenClaims: claims.filter((claim) => claim.riskLevel === 'verde').length,
      yellowClaims: claims.filter((claim) => claim.riskLevel === 'amarillo').length,
      redClaims: highRiskClaims.length,
      averageScore,
      totalClaimedAmount: claims.reduce((sum, claim) => sum + claim.claimedAmount, 0),
      highRiskAmount: highRiskClaims.reduce((sum, claim) => sum + claim.claimedAmount, 0),
    };
  }

  private buildRiskDistributionFromClaims(claims: TopRiskClaim[]): RiskDistributionItem[] {
    const totalClaims = claims.length;
    const levels: RiskLevel[] = ['rojo', 'amarillo', 'verde', 'critico'];

    return levels
      .map((level) => {
        const count = claims.filter((claim) => claim.riskLevel === level).length;
        return {
          level,
          label: level,
          count,
          percentage: totalClaims ? Math.round((count / totalClaims) * 100) : 0,
        };
      })
      .filter((item) => item.count > 0);
  }
}
