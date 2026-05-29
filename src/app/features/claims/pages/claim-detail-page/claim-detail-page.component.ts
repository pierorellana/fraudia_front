import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppCardComponent } from '../../../../shared/components/card/app-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClaimDetail } from '../../models/claim.model';
import { ReviewHistoryItem, ReviewRequest } from '../../models/review.model';
import { ClaimsService } from '../../services/claims.service';
import { ClaimAlertsListComponent } from '../../components/claim-alerts-list/claim-alerts-list.component';
import { ClaimDocumentsComponent } from '../../components/claim-documents/claim-documents.component';
import { ClaimHeaderComponent } from '../../components/claim-header/claim-header.component';
import { ClaimPolicyInfoComponent } from '../../components/claim-policy-info/claim-policy-info.component';
import { ClaimProviderInfoComponent } from '../../components/claim-provider-info/claim-provider-info.component';
import { ClaimReviewFormComponent } from '../../components/claim-review-form/claim-review-form.component';
import { ClaimScoreSummaryComponent } from '../../components/claim-score-summary/claim-score-summary.component';

@Component({
  selector: 'app-claim-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppCardComponent,
    EmptyStateComponent,
    CurrencyFormatPipe,
    DateFormatPipe,
    ClaimAlertsListComponent,
    ClaimDocumentsComponent,
    ClaimHeaderComponent,
    ClaimPolicyInfoComponent,
    ClaimProviderInfoComponent,
    ClaimReviewFormComponent,
    ClaimScoreSummaryComponent,
  ],
  template: `
    <section class="page">
      <ng-container *ngIf="!loading() && claim() as claimDetail">
        <app-claim-header
          [claim]="claimDetail"
          [evaluating]="evaluating()"
          [askingAgent]="askingAgent()"
          (evaluate)="evaluateClaim(claimDetail.id)"
          (askAgent)="askAgent(claimDetail.id)"
        ></app-claim-header>

        <div class="detail-grid">
          <app-claim-score-summary [claim]="claimDetail"></app-claim-score-summary>
          <app-card title="Datos generales" eyebrow="Registro del caso">
            <div class="info-grid">
              <div><span>Fecha de ocurrencia</span><strong>{{ claimDetail.occurrenceDate | dateFormat }}</strong></div>
              <div><span>Fecha de reporte</span><strong>{{ claimDetail.reportedDate | dateFormat }}</strong></div>
              <div><span>Estado</span><strong>{{ claimDetail.status || '-' }}</strong></div>
              <div><span>Sucursal</span><strong>{{ claimDetail.office || '-' }}</strong></div>
              <div><span>Monto reclamado</span><strong>{{ claimDetail.claimedAmount | currencyFormat }}</strong></div>
              <div><span>Monto estimado</span><strong>{{ claimDetail.estimatedAmount | currencyFormat }}</strong></div>
              <div><span>Monto pagado</span><strong>{{ claimDetail.paidAmount | currencyFormat }}</strong></div>
              <div><span>Documentos completos</span><strong>{{ claimDetail.documentsComplete ? 'Sí' : 'No' }}</strong></div>
            </div>
          </app-card>
        </div>

        <app-card title="Explicación y recomendación" eyebrow="Lectura del score">
          <p class="body-text">{{ claimDetail.score.explanation }}</p>
          <p class="body-text"><strong>Recomendación:</strong> {{ claimDetail.score.recommendation }}</p>
        </app-card>

        <div class="detail-grid detail-grid--two">
          <app-claim-policy-info [claim]="claimDetail"></app-claim-policy-info>
          <app-claim-provider-info [provider]="claimDetail.provider"></app-claim-provider-info>
        </div>

        <app-claim-alerts-list [alerts]="claimDetail.score.alerts"></app-claim-alerts-list>
        <app-claim-documents [documents]="claimDetail.documents"></app-claim-documents>

        <app-card title="Historial de revisión" eyebrow="Trazabilidad humana">
          <div class="review-history" *ngIf="reviewHistory().length > 0; else noReviews">
            <article *ngFor="let review of reviewHistory()">
              <strong>{{ getDecisionLabel(review.decision) }}</strong>
              <span>{{ review.createdAt | dateFormat: 'long' }} · {{ review.reviewer }}</span>
              <p>{{ review.comment }}</p>
              <small>{{ review.reviewStatus }}</small>
            </article>
          </div>
          <ng-template #noReviews>
            <p class="muted-text">Sin revisiones registradas.</p>
          </ng-template>
        </app-card>

        <app-claim-review-form (reviewSubmitted)="submitReview(claimDetail.id, $event)"></app-claim-review-form>
      </ng-container>

      <app-empty-state
        *ngIf="!loading() && !claim()"
        title="No hay información disponible"
        message="No se encontró el siniestro solicitado."
      ></app-empty-state>
    </section>
  `,
})
export class ClaimDetailPageComponent implements OnInit {
  loading = signal(true);
  evaluating = signal(false);
  askingAgent = signal(false);
  claim = signal<ClaimDetail | null>(null);
  reviewHistory = signal<ReviewHistoryItem[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private claimsService: ClaimsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const claimId = this.route.snapshot.paramMap.get('id');
    if (claimId) {
      this.loadClaim(claimId);
      this.loadReviewHistory(claimId);
    } else {
      this.loading.set(false);
    }
  }

  evaluateClaim(claimId: string): void {
    this.evaluating.set(true);
    this.claimsService.evaluateClaim(claimId).subscribe({
      next: () => {
        this.evaluating.set(false);
        this.notificationService.success('Siniestro evaluado correctamente.');
        this.loadClaim(claimId);
      },
      error: () => this.evaluating.set(false),
    });
  }

  askAgent(claimId: string): void {
    this.router.navigate(['/agent'], { queryParams: { claim_id: claimId } });
  }

  submitReview(claimId: string, review: ReviewRequest): void {
    this.claimsService.submitReview(claimId, review).subscribe({
      next: () => {
        this.notificationService.success('Revisión registrada correctamente.');
        this.loadReviewHistory(claimId);
      },
    });
  }

  getDecisionLabel(decision: ReviewHistoryItem['decision']): string {
    const labels: Record<ReviewHistoryItem['decision'], string> = {
      approve: 'Aprobar continuidad',
      reject: 'Rechazar por inconsistencias',
      escalate: 'Escalar a antifraude',
      request_information: 'Solicitar información adicional',
    };
    return labels[decision];
  }

  private loadClaim(claimId: string): void {
    this.loading.set(true);
    this.claimsService.getClaimDetail(claimId).subscribe({
      next: (claim) => {
        this.claim.set(claim);
        this.loading.set(false);
      },
      error: () => {
        this.claim.set(null);
        this.loading.set(false);
      },
    });
  }

  private loadReviewHistory(claimId: string): void {
    this.claimsService.getReviewHistory(claimId).subscribe({
      next: (history) => this.reviewHistory.set(history),
    });
  }
}
