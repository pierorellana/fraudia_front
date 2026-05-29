import { RiskLevel } from '../../../core/models/common.model';
import { getRiskLevelFromScore, normalizeRiskLevel } from '../../../shared/utils/risk.util';

export interface RiskAlertApiDto {
  id?: string | null;
  claim_id?: string | null;
  assessment_id?: string | null;
  code?: string | null;
  title?: string | null;
  category?: string | null;
  description?: string | null;
  points?: number | null;
  severity?: string | null;
  recommendation?: string | null;
  generated_at?: string | null;
}

export interface RiskAssessmentApiDto {
  id?: string | null;
  claim_id?: string | null;
  score?: number | string | null;
  level?: string | null;
  suggested_action?: string | null;
  explanation?: string | null;
  model_version?: string | null;
  signal_detail?: Record<string, unknown> | null;
  reviewed_by_analyst?: boolean;
  calculated_at?: string | null;
  alerts?: RiskAlertApiDto[];
}

export interface PolicyApiDto {
  id?: string | null;
  code?: string | null;
  insured_id?: string | null;
  branch?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  premium_amount?: number | string | null;
  insured_amount?: number | string | null;
  deductible?: number | string | null;
  sales_channel?: string | null;
  city?: string | null;
  status?: string | null;
}

export interface InsuredApiDto {
  id?: string | null;
  code?: string | null;
  segment?: string | null;
  seniority_months?: number | null;
  city?: string | null;
  policy_count?: number;
  claims_12m?: number;
  current_delinquency?: boolean;
  client_score?: number | string | null;
}

export interface VehicleApiDto {
  id: string;
  policy_id: string;
  plate?: string | null;
  chassis?: string | null;
  engine?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  color?: string | null;
}

export interface ProviderApiDto {
  id?: string | null;
  code?: string | null;
  name?: string | null;
  provider_type?: string | null;
  city?: string | null;
  associated_claims?: number;
  average_amount?: number | string | null;
  observed_cases_pct?: number | string | null;
  seniority_months?: number | null;
  is_restricted?: boolean;
}

export interface DocumentApiDto {
  id?: string | null;
  claim_id?: string | null;
  document_type?: string | null;
  delivered?: boolean;
  legible?: boolean;
  issue_date?: string | null;
  inconsistency_detected?: boolean;
  notes?: string | null;
  status?: string | null;
}

export interface ClaimApiDto {
  id?: string | null;
  code?: string | null;
  policy_id?: string | null;
  insured_id?: string | null;
  provider_id?: string | null;
  branch?: string | null;
  coverage?: string | null;
  occurrence_date?: string | null;
  reported_date?: string | null;
  claimed_amount?: number | string | null;
  estimated_amount?: number | string | null;
  paid_amount?: number | string | null;
  status?: string | null;
  office?: string | null;
  description?: string | null;
  documents_complete?: boolean;
  days_from_policy_start?: number | null;
  days_from_policy_end?: number | null;
  report_delay_days?: number | null;
  insured_claim_history?: number;
  vehicle_plate?: string | null;
  documents?: DocumentApiDto[];
  risk_assessment?: RiskAssessmentApiDto | null;
  policy?: PolicyApiDto | null;
  insured?: InsuredApiDto | null;
  provider?: ProviderApiDto | null;
  created_at?: string | null;
  ramo?: string | null;
  cobertura?: string | null;
  estado?: string | null;
  fecha_ocurrencia?: string | null;
  monto_reclamado?: number | string | null;
  score?: number | string | null;
  nivel_riesgo?: string | null;
}

export interface ClaimListApiResponse {
  items: ClaimApiDto[];
  total: number;
  limit: number;
  offset: number;
}

export interface ClaimAlert {
  id?: string | null;
  code: string;
  title: string;
  category: string;
  description: string;
  points: number;
  severity: RiskLevel;
  recommendation?: string | null;
  generatedAt?: string | null;
}

export interface ClaimScore {
  finalScore: number;
  rulesScore: number;
  aiScore: number;
  nlpScore: number;
  level: RiskLevel;
  recommendation: string;
  explanation: string;
  calculatedAt?: string | null;
  modelVersion?: string | null;
  alerts: ClaimAlert[];
}

export interface Policy {
  id: string;
  code?: string | null;
  insuredId: string;
  branch: string;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  insuredAmount: number;
  deductible: number;
  salesChannel?: string | null;
  city?: string | null;
  status?: string | null;
}

export interface Insured {
  id: string;
  code?: string | null;
  segment?: string | null;
  seniorityMonths: number;
  city?: string | null;
  policyCount: number;
  claimsLastYear: number;
  currentDelinquency: boolean;
  clientScore: number;
}

export interface Vehicle {
  id: string;
  policyId: string;
  plate?: string | null;
  chassis?: string | null;
  engine?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  color?: string | null;
}

export interface Provider {
  id: string;
  code?: string | null;
  name?: string | null;
  providerType?: string | null;
  city?: string | null;
  associatedClaims: number;
  averageAmount: number;
  observedCasesPct: number;
  seniorityMonths?: number | null;
  isRestricted: boolean;
}

export interface DocumentItem {
  id: string;
  documentType: string;
  delivered: boolean;
  legible: boolean;
  issueDate?: string | null;
  inconsistencyDetected: boolean;
  notes?: string | null;
  status?: string | null;
}

export interface Claim {
  id: string;
  code: string;
  policyId: string;
  insuredId: string;
  providerId?: string | null;
  branch?: string | null;
  coverage?: string | null;
  occurrenceDate?: string | null;
  reportedDate?: string | null;
  claimedAmount: number;
  estimatedAmount: number;
  paidAmount: number;
  status?: string | null;
  office?: string | null;
  description?: string | null;
  documentsComplete: boolean;
  daysFromPolicyStart?: number | null;
  daysFromPolicyEnd?: number | null;
  reportDelayDays?: number | null;
  insuredClaimHistory: number;
  vehiclePlate?: string | null;
  score: ClaimScore;
  createdAt?: string | null;
}

export interface ClaimDetail extends Claim {
  policy?: Policy | null;
  insured?: Insured | null;
  provider?: Provider | null;
  vehicle?: Vehicle | null;
  documents: DocumentItem[];
}

export interface ClaimFilters {
  riskLevel?: RiskLevel | '';
  branch?: string;
  city?: string;
  provider?: string;
  dateFrom?: string;
  dateTo?: string;
  sortDirection?: 'asc' | 'desc';
  page: number;
  limit: number;
}

export function mapClaimFromApi(dto: ClaimApiDto): Claim {
  const claimId = resolveClaimIdentifier(dto);
  const branch = firstText(dto.branch, dto.ramo);
  const coverage = firstText(dto.coverage, dto.cobertura);
  const status = firstText(dto.status, dto.estado);
  const occurrenceDate = firstText(dto.occurrence_date, dto.fecha_ocurrencia);
  const claimedAmount = dto.claimed_amount ?? dto.monto_reclamado;
  const assessment = resolveRiskAssessment(dto);

  return {
    id: claimId,
    code: claimId,
    policyId: firstText(dto.policy_id, dto.policy?.id, dto.policy?.code) ?? '',
    insuredId: firstText(dto.insured_id, dto.insured?.id, dto.insured?.code) ?? '',
    providerId: firstText(dto.provider_id, dto.provider?.id, dto.provider?.code, dto.provider?.name) ?? null,
    branch,
    coverage,
    occurrenceDate,
    reportedDate: dto.reported_date,
    claimedAmount: toNumber(claimedAmount),
    estimatedAmount: toNumber(dto.estimated_amount),
    paidAmount: toNumber(dto.paid_amount),
    status,
    office: dto.office,
    description: dto.description,
    documentsComplete: dto.documents_complete ?? false,
    daysFromPolicyStart: dto.days_from_policy_start,
    daysFromPolicyEnd: dto.days_from_policy_end,
    reportDelayDays: dto.report_delay_days,
    insuredClaimHistory: dto.insured_claim_history ?? 0,
    vehiclePlate: dto.vehicle_plate,
    score: mapRiskAssessmentFromApi(assessment, claimId),
    createdAt: dto.created_at,
  };
}

export function mapClaimDetailFromApi(dto: ClaimApiDto): ClaimDetail {
  const claim = mapClaimFromApi(dto);
  return {
    ...claim,
    policy: dto.policy ? mapPolicyFromApi(dto.policy) : null,
    insured: dto.insured ? mapInsuredFromApi(dto.insured) : null,
    provider: dto.provider ? mapProviderFromApi(dto.provider) : null,
    vehicle: dto.vehicle_plate
      ? {
          id: dto.vehicle_plate,
          policyId: claim.policyId,
          plate: dto.vehicle_plate,
        }
      : null,
    documents: (dto.documents ?? []).map((document, index) => mapDocumentFromApi(document, claim.id, index)),
  };
}

export function mapRiskAssessmentFromApi(dto: RiskAssessmentApiDto | null | undefined, claimId: string): ClaimScore {
  const finalScore = Math.round(toNumber(dto?.score));
  const level = normalizeRiskLevel(dto?.level ?? getRiskLevelFromScore(finalScore));

  return {
    finalScore,
    rulesScore: finalScore,
    aiScore: Math.round(finalScore * 0.86),
    nlpScore: Math.round(finalScore * 0.72),
    level,
    recommendation: dto?.suggested_action ?? 'Continuar con revisión estándar.',
    explanation: dto?.explanation ?? 'Aún no existe una evaluación para este siniestro.',
    calculatedAt: dto?.calculated_at,
    modelVersion: dto?.model_version,
    alerts: (dto?.alerts ?? []).map((alert) => mapAlertFromApi(alert, claimId)),
  };
}

export function mapAlertFromApi(dto: RiskAlertApiDto, claimId: string): ClaimAlert {
  return {
    id: dto.id,
    code: dto.code ?? 'SIN-CODIGO',
    title: dto.title ?? dto.category ?? dto.code ?? 'Alerta de riesgo',
    category: dto.category ?? claimId,
    description: dto.description ?? 'La regla generó una señal para revisión.',
    points: dto.points ?? 0,
    severity: normalizeRiskLevel(dto.severity),
    recommendation: dto.recommendation,
    generatedAt: dto.generated_at,
  };
}

function mapPolicyFromApi(dto: PolicyApiDto): Policy {
  return {
    id: firstText(dto.id, dto.code) ?? 'Sin codigo',
    code: dto.code,
    insuredId: dto.insured_id ?? '',
    branch: dto.branch ?? 'Sin ramo',
    startDate: dto.start_date ?? '',
    endDate: dto.end_date ?? '',
    premiumAmount: toNumber(dto.premium_amount),
    insuredAmount: toNumber(dto.insured_amount),
    deductible: toNumber(dto.deductible),
    salesChannel: dto.sales_channel,
    city: dto.city,
    status: dto.status,
  };
}

function mapInsuredFromApi(dto: InsuredApiDto): Insured {
  return {
    id: firstText(dto.id, dto.code) ?? 'Sin codigo',
    code: dto.code,
    segment: dto.segment,
    seniorityMonths: dto.seniority_months ?? 0,
    city: dto.city,
    policyCount: dto.policy_count ?? 0,
    claimsLastYear: dto.claims_12m ?? 0,
    currentDelinquency: dto.current_delinquency ?? false,
    clientScore: toNumber(dto.client_score),
  };
}

function mapProviderFromApi(dto: ProviderApiDto): Provider {
  return {
    id: firstText(dto.id, dto.code, dto.name) ?? 'Sin codigo',
    code: dto.code,
    name: dto.name,
    providerType: dto.provider_type,
    city: dto.city,
    associatedClaims: dto.associated_claims ?? 0,
    averageAmount: toNumber(dto.average_amount),
    observedCasesPct: toNumber(dto.observed_cases_pct),
    seniorityMonths: dto.seniority_months,
    isRestricted: dto.is_restricted ?? false,
  };
}

function mapDocumentFromApi(dto: DocumentApiDto, claimId: string, index: number): DocumentItem {
  return {
    id: dto.id ?? `${claimId}-doc-${index + 1}`,
    documentType: dto.document_type ?? 'Documento',
    delivered: dto.delivered ?? false,
    legible: dto.legible ?? true,
    issueDate: dto.issue_date,
    inconsistencyDetected: dto.inconsistency_detected ?? false,
    notes: dto.notes,
    status: dto.status,
  };
}

function resolveClaimIdentifier(dto: ClaimApiDto): string {
  return firstText(dto.code, dto.id) ?? 'SIN-SIN-CODIGO';
}

function resolveRiskAssessment(dto: ClaimApiDto): RiskAssessmentApiDto | null | undefined {
  if (dto.risk_assessment) {
    return dto.risk_assessment;
  }

  if (dto.score !== null && dto.score !== undefined) {
    return {
      claim_id: resolveClaimIdentifier(dto),
      score: dto.score,
      level: dto.nivel_riesgo,
      suggested_action: dto.nivel_riesgo
        ? 'Priorizar según el nivel de riesgo calculado.'
        : 'Continuar con revisión estándar.',
      alerts: [],
    };
  }

  return null;
}

function firstText(...values: Array<string | null | undefined>): string | undefined {
  for (const value of values) {
    const normalized = value?.trim();
    if (normalized) {
      return normalized;
    }
  }
  return undefined;
}

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}
