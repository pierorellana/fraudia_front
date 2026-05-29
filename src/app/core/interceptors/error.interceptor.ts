import { Injectable } from '@angular/core';
import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

export const SUPPRESS_AGENT_SESSION_ERROR_NOTIFICATION = new HttpContextToken<boolean>(() => false);

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = this.resolveErrorMessage(error);
        if (!this.shouldSuppressNotification(request, error, errorMessage)) {
          this.notificationService.error(errorMessage);
        }
        return throwError(() => error);
      })
    );
  }

  private shouldSuppressNotification(
    request: HttpRequest<unknown>,
    error: HttpErrorResponse,
    errorMessage: string
  ): boolean {
    if (!request.context.get(SUPPRESS_AGENT_SESSION_ERROR_NOTIFICATION) || error.status !== 422) {
      return false;
    }

    const normalizedMessage = errorMessage.toLowerCase();
    return normalizedMessage.includes('sesion') || normalizedMessage.includes('session');
  }

  private resolveErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }

    const detail = this.readBackendDetail(error.error);
    if (detail) {
      return detail;
    }

    if (error.status === 401) {
      return 'No autorizado. Por favor, inicia sesión nuevamente.';
    }

    if (error.status === 403) {
      return 'No tienes permiso para acceder a este recurso.';
    }

    if (error.status === 404) {
      return 'No hay información disponible.';
    }

    return 'No se pudo procesar la solicitud. Inténtalo nuevamente.';
  }

  private readBackendDetail(payload: unknown): string | null {
    if (typeof payload !== 'object' || payload === null) {
      return null;
    }

    const record = payload as Record<string, unknown>;
    if (typeof record['detail'] === 'string') {
      return record['detail'];
    }

    if (Array.isArray(record['detail'])) {
      const firstDetail = record['detail'].find((item) => typeof item === 'object' && item !== null);
      if (firstDetail) {
        const detailRecord = firstDetail as Record<string, unknown>;
        if (typeof detailRecord['msg'] === 'string') {
          return detailRecord['msg'];
        }
      }
    }

    const error = record['error'];
    if (typeof error === 'object' && error !== null) {
      const errorRecord = error as Record<string, unknown>;
      if (typeof errorRecord['message'] === 'string') {
        return errorRecord['message'];
      }
    }

    if (typeof record['message'] === 'string') {
      return record['message'];
    }

    return null;
  }
}
