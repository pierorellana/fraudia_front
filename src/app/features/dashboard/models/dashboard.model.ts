import { RiskLevel } from '../../../core/models/common.model';
import { Claim, ClaimApiDto, mapClaimFromApi } from '../../claims/models/claim.model';
import { calculatePercentage, normalizeRiskLevel } from '../../../shared/utils/risk.util';

export interface RiskDistributionApiDto {
  level: string;
  count: number;
}

export interface RiskLevelCountApiDto {
  nivel_riesgo: string;
  count: number;
}

export interface BranchCountApiDto {
  ramo: string;
  count: number;
}

export interface TopIndicatorApiDto {
  codigo_regla: string;
  frecuencia: number;
}

export interface DashboardSummaryApiDto {
  total_claims?: number;
  assessed_claims?: number;
  average_score?: number;
  total_claimed_amount?: number | string;
  high_risk_amount?: number | string;
  distribution?: RiskDistributionApiDto[];
  casos_alto_riesgo?: number;
  casos_en_bandeja?: number;
  exposicion_total?: number | string;
  score_promedio_ia?: number;
  casos_por_ramo?: BranchCountApiDto[];
  distribucion_nivel_riesgo?: RiskLevelCountApiDto[];
  top_indicadores?: TopIndicatorApiDto[];
}

export interface ProviderRankingApiDto {
  provider_id?: string;
  provider_code?: string | null;
  provider_name?: string;
  provider_type?: string;
  total_claims?: number;
  high_risk_claims?: number;
  average_score?: number;
  total_claimed_amount?: number | string;
  is_restricted?: boolean;
  proveedor?: string;
  tipo?: string;
  casos_alto_riesgo?: number;
  score_promedio?: number;
}

export interface ProviderDashboardApiDto {
  total_proveedores: number;
  proveedores_con_siniestros: number;
  proveedores_restringidos: number;
  casos_asociados: number;
  casos_alto_riesgo: number;
  exposicion_total: number | string;
  score_promedio: number;
  items: ProviderRankingApiDto[];
}

export interface AlertRankingApiDto {
  code?: string;
  title?: string;
  severity?: string;
  occurrences?: number;
  total_points?: number;
  codigo_regla?: string;
  indicador?: string;
  frecuencia?: number;
}

export interface AlertDashboardApiDto {
  total_alertas: number;
  reglas_activadas: number;
  casos_con_alertas: number;
  puntos_totales: number;
  items: AlertRankingApiDto[];
}

export interface DashboardSummary {
  totalClaims: number;
  assessedClaims: number;
  pendingClaims: number;
  greenClaims: number;
  yellowClaims: number;
  redClaims: number;
  averageScore: number;
  totalClaimedAmount: number;
  highRiskAmount: number;
}

export interface RiskDistributionItem {
  level: RiskLevel;
  label: string;
  count: number;
  percentage: number;
}

export interface TopRiskClaim {
  id: string;
  branch: string;
  coverage: string;
  finalScore: number;
  riskLevel: RiskLevel;
  claimedAmount: number;
  mainAlerts: string[];
}

export interface ProviderRankingItem {
  providerId: string;
  providerName: string;
  providerType: string;
  totalClaims: number;
  highRiskClaims: number;
  averageScore: number;
  totalClaimedAmount: number;
  isRestricted: boolean;
}

export interface CityAlertItem {
  city: string;
  totalClaims: number;
  highRiskClaims: number;
  averageScore: number;
}

export interface BranchRiskItem {
  branch: string;
  totalClaims: number;
  redClaims: number;
  yellowClaims: number;
  averageScore: number;
}

export interface AlertRankingItem {
  code: string;
  title: string;
  severity: RiskLevel;
  occurrences: number;
  totalPoints: number;
}

export interface DashboardViewModel {
  summary: DashboardSummary;
  riskDistribution: RiskDistributionItem[];
  topRiskClaims: TopRiskClaim[];
  branchRisk: BranchRiskItem[];
  alertRanking: AlertRankingItem[];
}

export function mapDashboardSummaryFromApi(dto: DashboardSummaryApiDto): DashboardSummary {
  const distribution = getRiskDistributionItems(dto);
  const totalClaims = dto.total_claims ?? dto.casos_en_bandeja ?? 0;
  const assessedClaims = dto.assessed_claims ?? totalClaims;
  const greenClaims = getDistributionCount(distribution, 'verde');
  const yellowClaims = getDistributionCount(distribution, 'amarillo');
  const redClaims =
    dto.casos_alto_riesgo ?? getDistributionCount(distribution, 'rojo') + getDistributionCount(distribution, 'critico');

  return {
    totalClaims,
    assessedClaims,
    pendingClaims: Math.max(0, totalClaims - assessedClaims),
    greenClaims,
    yellowClaims,
    redClaims,
    averageScore: Math.round(dto.score_promedio_ia ?? dto.average_score ?? 0),
    totalClaimedAmount: Number(dto.exposicion_total ?? dto.total_claimed_amount ?? 0),
    highRiskAmount: Number(dto.high_risk_amount ?? 0),
  };
}

export function mapRiskDistributionFromApi(dto: DashboardSummaryApiDto): RiskDistributionItem[] {
  const distribution = getRiskDistributionItems(dto);
  const total = distribution.reduce((sum, item) => sum + item.count, 0);
  return distribution.map((item) => {
    const level = normalizeRiskLevel(item.level);
    return {
      level,
      label: level,
      count: item.count,
      percentage: calculatePercentage(item.count, total),
    };
  });
}

export function mapBranchRiskFromSummary(dto: DashboardSummaryApiDto): BranchRiskItem[] {
  return (dto.casos_por_ramo ?? []).map((item) => ({
    branch: item.ramo || 'Sin ramo',
    totalClaims: item.count,
    redClaims: 0,
    yellowClaims: 0,
    averageScore: 0,
  }));
}

export function mapTopRiskClaimFromApi(dto: ClaimApiDto): TopRiskClaim {
  const claim = mapClaimFromApi(dto);
  return mapTopRiskClaimFromClaim(claim);
}

export function mapTopRiskClaimFromClaim(claim: Claim): TopRiskClaim {
  return {
    id: claim.id,
    branch: claim.branch ?? 'Sin ramo',
    coverage: claim.coverage ?? 'Sin cobertura',
    finalScore: claim.score.finalScore,
    riskLevel: claim.score.level,
    claimedAmount: claim.claimedAmount,
    mainAlerts: claim.score.alerts.slice(0, 3).map((alert) => alert.title),
  };
}

export function mapProviderRankingFromApi(dto: ProviderRankingApiDto): ProviderRankingItem {
  const providerName = dto.provider_name ?? dto.proveedor ?? 'Sin proveedor';
  return {
    providerId: dto.provider_id ?? dto.provider_code ?? providerName,
    providerName,
    providerType: dto.provider_type ?? dto.tipo ?? 'Sin tipo',
    totalClaims: dto.total_claims ?? dto.casos_alto_riesgo ?? 0,
    highRiskClaims: dto.high_risk_claims ?? dto.casos_alto_riesgo ?? 0,
    averageScore: Math.round(dto.average_score ?? dto.score_promedio ?? 0),
    totalClaimedAmount: Number(dto.total_claimed_amount ?? 0),
    isRestricted: dto.is_restricted ?? false,
  };
}

export function mapAlertRankingFromApi(dto: AlertRankingApiDto): AlertRankingItem {
  const code = dto.code ?? dto.codigo_regla ?? 'SIN-CODIGO';
  return {
    code,
    title: dto.title ?? dto.indicador ?? code,
    severity: normalizeRiskLevel(dto.severity),
    occurrences: dto.occurrences ?? dto.frecuencia ?? 0,
    totalPoints: dto.total_points ?? 0,
  };
}

function getDistributionCount(items: RiskDistributionApiDto[], level: RiskLevel): number {
  return items
    .filter((item) => normalizeRiskLevel(item.level) === level)
    .reduce((sum, item) => sum + item.count, 0);
}

function getRiskDistributionItems(dto: DashboardSummaryApiDto): RiskDistributionApiDto[] {
  if (dto.distribucion_nivel_riesgo?.length) {
    return dto.distribucion_nivel_riesgo.map((item) => ({
      level: item.nivel_riesgo,
      count: item.count,
    }));
  }

  return dto.distribution ?? [];
}
