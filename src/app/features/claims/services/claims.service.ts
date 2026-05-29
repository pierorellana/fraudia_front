import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { PaginatedResult } from '../../../core/models/pagination.model';
import { QueryParams } from '../../../core/models/api-response.model';
import { HttpClientService } from '../../../core/services/http-client.service';
import {
  Claim,
  ClaimAlert,
  ClaimApiDto,
  ClaimDetail,
  ClaimFilters,
  ClaimListApiResponse,
  ClaimScore,
  RiskAssessmentApiDto,
  mapClaimDetailFromApi,
  mapClaimFromApi,
  mapRiskAssessmentFromApi,
} from '../models/claim.model';
import { ReviewHistoryItem, ReviewRequest } from '../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class ClaimsService {
  constructor(private http: HttpClientService) {}

  listClaims(filters: ClaimFilters): Observable<PaginatedResult<Claim>> {
    const page = Math.max(filters.page, 1);
    const limit = Math.max(filters.limit, 1);
    const riskLevel = filters.riskLevel === 'critico' ? 'rojo' : filters.riskLevel || undefined;

    const params: QueryParams = {
      limit,
      offset: (page - 1) * limit,
      risk_level: riskLevel,
      min_score: filters.riskLevel === 'critico' ? 90 : undefined,
    };

    return this.http.get<ClaimListApiResponse>(API_ENDPOINTS.claims.list, params).pipe(
      map((response) => {
        const mappedClaims = response.items.map(mapClaimFromApi);
        const filteredClaims = this.applyClientFilters(mappedClaims, filters);
        const sortedClaims = this.sortClaims(filteredClaims, filters.sortDirection);

        return {
          items: sortedClaims,
          total: response.total,
          limit,
          offset: (page - 1) * limit,
          page,
          totalPages: Math.max(1, Math.ceil(response.total / limit)),
        };
      })
    );
  }

  listAllClaims(limit = 50): Observable<Claim[]> {
    return this.http
      .get<ClaimListApiResponse>(API_ENDPOINTS.claims.list, { limit, offset: 0 })
      .pipe(map((response) => response.items.map(mapClaimFromApi)));
  }

  listClaimsPaginated(page: number, limit: number, riskLevel = ''): Observable<PaginatedResult<Claim>> {
    const normalizedRiskLevel = riskLevel === 'critico' ? 'rojo' : riskLevel || undefined;
    return this.http
      .get<ClaimListApiResponse>(API_ENDPOINTS.claims.list, {
        limit,
        offset: (page - 1) * limit,
        risk_level: normalizedRiskLevel,
        min_score: riskLevel === 'critico' ? 90 : undefined,
      })
      .pipe(
        map((res) => ({
          items: res.items.map(mapClaimFromApi),
          total: res.total,
          limit,
          offset: (page - 1) * limit,
          page,
          totalPages: Math.max(1, Math.ceil(res.total / limit)),
        })),
      );
  }

  getClaimDetail(claimId: string): Observable<ClaimDetail> {
    return this.http.get<ClaimApiDto>(API_ENDPOINTS.claims.detail(claimId)).pipe(map(mapClaimDetailFromApi));
  }

  evaluateClaim(claimId: string): Observable<ClaimScore> {
    return this.http
      .post<RiskAssessmentApiDto>(API_ENDPOINTS.claims.assess(claimId))
      .pipe(map((assessment) => mapRiskAssessmentFromApi(assessment, claimId)));
  }

  getClaimAlerts(claimId: string): Observable<ClaimAlert[]> {
    return this.getClaimDetail(claimId).pipe(map((claim) => claim.score.alerts));
  }

  submitReview(claimId: string, review: ReviewRequest): Observable<ReviewHistoryItem> {
    const reviewItem: ReviewHistoryItem = {
      ...review,
      id: this.generateLocalId(),
      claimId,
      createdAt: new Date().toISOString(),
    };
    const history = [reviewItem, ...this.readReviewHistory(claimId)];
    localStorage.setItem(this.reviewStorageKey(claimId), JSON.stringify(history));
    return of(reviewItem).pipe(delay(250));
  }

  getReviewHistory(claimId: string): Observable<ReviewHistoryItem[]> {
    return of(this.readReviewHistory(claimId)).pipe(delay(100));
  }

  private applyClientFilters(claims: Claim[], filters: ClaimFilters): Claim[] {
    return claims.filter((claim) => {
      const branchMatches = !filters.branch || (claim.branch ?? '').toLowerCase().includes(filters.branch.toLowerCase());
      const dateMatches = this.matchesDateRange(claim.occurrenceDate, filters.dateFrom, filters.dateTo);
      return branchMatches && dateMatches;
    });
  }

  private sortClaims(claims: Claim[], direction?: 'asc' | 'desc'): Claim[] {
    if (!direction) {
      return claims;
    }

    return [...claims].sort((left, right) => {
      const diff = left.score.finalScore - right.score.finalScore;
      return direction === 'asc' ? diff : -diff;
    });
  }

  private matchesDateRange(date: string | null | undefined, from?: string, to?: string): boolean {
    if (!date || (!from && !to)) {
      return true;
    }

    const value = new Date(date).getTime();
    const min = from ? new Date(from).getTime() : Number.NEGATIVE_INFINITY;
    const max = to ? new Date(to).getTime() : Number.POSITIVE_INFINITY;
    return value >= min && value <= max;
  }

  private readReviewHistory(claimId: string): ReviewHistoryItem[] {
    const rawValue = localStorage.getItem(this.reviewStorageKey(claimId));
    if (!rawValue) {
      return [];
    }

    try {
      return JSON.parse(rawValue) as ReviewHistoryItem[];
    } catch {
      return [];
    }
  }

  private reviewStorageKey(claimId: string): string {
    return `fraudia.reviews.${claimId}`;
  }

  private generateLocalId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  }
}
