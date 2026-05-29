import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap, timeout } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { HttpClientService } from '../../../core/services/http-client.service';
import {
  AgentQueryApiResponse,
  AgentQueryRequest,
  AgentQueryResponse,
  SuggestedQuestion,
  mapAgentRequestToApi,
  mapAgentResponseFromApi,
} from '../models/agent.model';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  private readonly agentUserId = '30802e66-afa3-4be1-9ef6-aa15baea763a';
  private readonly responseTimeoutMs = 25000;
  private readonly sessionStoragePrefix = 'fraudia.agent.session.';

  constructor(private http: HttpClientService) {}

  query(request: AgentQueryRequest): Observable<AgentQueryResponse> {
    const preparedRequest = this.prepareRequest(request);

    return this.sendQuery(preparedRequest, Boolean(preparedRequest.claimId && preparedRequest.sessionId)).pipe(
      tap((response) => this.persistSession(preparedRequest, response)),
      catchError((error) => {
        if (!this.shouldRetryWithoutSession(error, preparedRequest)) {
          return throwError(() => error);
        }

        this.clearSessionForClaim(preparedRequest.claimId);
        const retryRequest: AgentQueryRequest = {
          ...preparedRequest,
          sessionId: null,
        };

        return this.sendQuery(retryRequest).pipe(tap((response) => this.persistSession(retryRequest, response)));
      })
    );
  }

  explainClaim(claimId: string): Observable<AgentQueryResponse> {
    return this.query({
      claimId,
      question: `Explica las principales señales de riesgo del siniestro ${claimId}.`,
      useLlm: true,
    });
  }

  getStoredSessionId(claimCode: string | null | undefined): string | null {
    const normalizedClaimCode = this.normalizeClaimCode(claimCode);
    if (!normalizedClaimCode) {
      return null;
    }
    return this.readStorage(this.sessionStorageKey(normalizedClaimCode));
  }

  clearSessionForClaim(claimCode: string | null | undefined): void {
    const normalizedClaimCode = this.normalizeClaimCode(claimCode);
    if (!normalizedClaimCode) {
      return;
    }
    this.removeStorage(this.sessionStorageKey(normalizedClaimCode));
  }

  getSuggestedQuestions(): Observable<SuggestedQuestion[]> {
    return of([
      {
        id: 'critical-cases',
        question: '¿Cuáles son los siniestros con mayor prioridad de revisión?',
      },
      {
        id: 'provider-patterns',
        question: '¿Qué proveedores concentran más señales de riesgo?',
      },
      {
        id: 'rule-explanation',
        question: 'Explícame qué reglas generan más alertas rojas.',
      },
      {
        id: 'executive-summary',
        question: 'Genera un resumen ejecutivo para el supervisor de siniestros.',
      },
    ]).pipe(delay(80));
  }

  private sendQuery(
    request: AgentQueryRequest,
    suppressSessionErrorNotification = false
  ): Observable<AgentQueryResponse> {
    return this.http
      .post<AgentQueryApiResponse>(API_ENDPOINTS.agent.query, mapAgentRequestToApi(request), undefined, {
        suppressAgentSessionErrorNotification: suppressSessionErrorNotification,
        skipGlobalLoading: true,
      })
      .pipe(
        map(mapAgentResponseFromApi),
        timeout(this.responseTimeoutMs)
      );
  }

  private prepareRequest(request: AgentQueryRequest): AgentQueryRequest {
    const claimCode = this.normalizeClaimCode(request.claimId);
    const storedSessionId = claimCode && !request.sessionId ? this.getStoredSessionId(claimCode) : null;

    return {
      ...request,
      question: request.question.trim(),
      claimId: claimCode,
      sessionId: request.sessionId ?? storedSessionId ?? null,
      userId: this.agentUserId,
      useLlm: true,
    };
  }

  private persistSession(request: AgentQueryRequest, response: AgentQueryResponse): void {
    if (!request.claimId || !response.sessionId) {
      return;
    }
    this.writeStorage(this.sessionStorageKey(request.claimId), response.sessionId);
  }

  private shouldRetryWithoutSession(error: unknown, request: AgentQueryRequest): boolean {
    if (!request.claimId || !request.sessionId || !(error instanceof HttpErrorResponse) || error.status !== 422) {
      return false;
    }

    const message = this.extractErrorMessage(error).toLowerCase();
    return message.includes('sesion') || message.includes('session');
  }

  private normalizeClaimCode(value: string | null | undefined): string | null {
    const normalized = value?.trim();
    return normalized ? normalized.toUpperCase() : null;
  }

  private sessionStorageKey(claimCode: string): string {
    return `${this.sessionStoragePrefix}${claimCode}`;
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const payload = error.error;
    if (typeof payload !== 'object' || payload === null) {
      return '';
    }

    const record = payload as Record<string, unknown>;
    const wrappedError = record['error'];
    if (typeof wrappedError === 'object' && wrappedError !== null) {
      const wrappedErrorRecord = wrappedError as Record<string, unknown>;
      if (typeof wrappedErrorRecord['message'] === 'string') {
        return wrappedErrorRecord['message'];
      }
    }

    if (typeof record['message'] === 'string') {
      return record['message'];
    }

    if (typeof record['detail'] === 'string') {
      return record['detail'];
    }

    return '';
  }

  private readStorage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private writeStorage(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
  }

  private removeStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
  }
}
