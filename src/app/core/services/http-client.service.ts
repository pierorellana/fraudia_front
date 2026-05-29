import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, QueryParams } from '../models/api-response.model';
import { EnvironmentService } from './environment.service';
import { SUPPRESS_AGENT_SESSION_ERROR_NOTIFICATION } from '../interceptors/error.interceptor';
import { SKIP_GLOBAL_LOADING } from '../interceptors/loading.interceptor';

export interface HttpClientRequestOptions {
  suppressAgentSessionErrorNotification?: boolean;
  skipGlobalLoading?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HttpClientService {
  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService
  ) {}

  get<T>(endpoint: string, params?: QueryParams): Observable<T> {
    return this.http
      .get<ApiResponse<T> | T>(this.buildUrl(endpoint), { params: this.buildParams(params) })
      .pipe(map((response) => this.unwrapResponse(response)));
  }

  post<T>(
    endpoint: string,
    body?: unknown,
    params?: QueryParams,
    options?: HttpClientRequestOptions
  ): Observable<T> {
    return this.http
      .post<ApiResponse<T> | T>(this.buildUrl(endpoint), body ?? {}, {
        params: this.buildParams(params),
        context: this.buildContext(options),
      })
      .pipe(map((response) => this.unwrapResponse(response)));
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .put<ApiResponse<T> | T>(this.buildUrl(endpoint), body)
      .pipe(map((response) => this.unwrapResponse(response)));
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .patch<ApiResponse<T> | T>(this.buildUrl(endpoint), body)
      .pipe(map((response) => this.unwrapResponse(response)));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T> | T>(this.buildUrl(endpoint))
      .pipe(map((response) => this.unwrapResponse(response)));
  }

  uploadFile<T>(endpoint: string, file: File, params?: QueryParams): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<ApiResponse<T> | T>(this.buildUrl(endpoint), formData, { params: this.buildParams(params) })
      .pipe(map((response) => this.unwrapResponse(response)));
  }

  private buildUrl(endpoint: string): string {
    return `${this.environmentService.apiBaseUrl}${endpoint}`;
  }

  private buildParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return httpParams;
  }

  private buildContext(options?: HttpClientRequestOptions): HttpContext {
    let context = new HttpContext();
    if (options?.suppressAgentSessionErrorNotification) {
      context = context.set(SUPPRESS_AGENT_SESSION_ERROR_NOTIFICATION, true);
    }
    if (options?.skipGlobalLoading) {
      context = context.set(SKIP_GLOBAL_LOADING, true);
    }
    return context;
  }

  private unwrapResponse<T>(response: ApiResponse<T> | T): T {
    if (this.isApiResponse(response)) {
      if (!response.success) {
        throw new Error(response.error?.message ?? 'No se pudo procesar la solicitud. Inténtalo nuevamente.');
      }
      return response.data as T;
    }

    return response;
  }

  private isApiResponse<T>(response: ApiResponse<T> | T): response is ApiResponse<T> {
    return typeof response === 'object' && response !== null && 'success' in response && 'data' in response;
  }
}
