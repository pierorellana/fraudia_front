import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BatchAssessmentResult } from '../../uploads/models/upload.model';
import { ClaimScore } from '../models/claim.model';
import { ClaimsService } from './claims.service';

export interface BatchAssessmentRequest {
  claimIds: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ScoringService {
  constructor(private claimsService: ClaimsService) {}

  evaluateClaim(claimId: string): Observable<ClaimScore> {
    return this.claimsService.evaluateClaim(claimId);
  }

  evaluateBatch(request: BatchAssessmentRequest): Observable<BatchAssessmentResult> {
    if (request.claimIds.length === 0) {
      return of({
        processed: 0,
        message: 'No hay siniestros para evaluar.',
      });
    }

    return forkJoin(request.claimIds.map((claimId) => this.evaluateClaim(claimId))).pipe(
      map((scores) => ({
        processed: scores.length,
        message: 'Evaluación batch finalizada correctamente.',
      }))
    );
  }

  confirmImportedDatasetAssessment(processed: number): Observable<BatchAssessmentResult> {
    return of({
      processed,
      message: 'El backend evaluó los siniestros durante la carga del dataset.',
    });
  }
}
