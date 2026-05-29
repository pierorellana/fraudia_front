import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppButtonComponent } from '../../../../shared/components/button/app-button.component';
import { AppCardComponent } from '../../../../shared/components/card/app-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { PaginatedResult } from '../../../../core/models/pagination.model';
import { Claim, ClaimFilters } from '../../models/claim.model';
import { ClaimsService } from '../../services/claims.service';
import { ClaimsFiltersComponent } from '../../components/claims-filters/claims-filters.component';
import { ClaimsTableComponent } from '../../components/claims-table/claims-table.component';

@Component({
  selector: 'app-claims-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppButtonComponent,
    AppCardComponent,
    EmptyStateComponent,
    ClaimsFiltersComponent,
    ClaimsTableComponent,
  ],
  template: `
    <section class="page">
      <ng-container *ngIf="!loading() && result() as claimsResult">
        <header class="page-header">
          <div>
            <p class="page-kicker">Bandeja operativa</p>
            <h1>Siniestros</h1>
            <span>Filtra, prioriza y recalcula el riesgo de cada caso.</span>
          </div>
        </header>

        <div class="app-card">
          <app-claims-filters
            [total]="claimsResult.total"
            (filtersChanged)="onFiltersChanged($event)"
          ></app-claims-filters>
        </div>

        <app-empty-state
          *ngIf="claimsResult.items.length === 0"
          title="No hay información disponible"
          message="No hay siniestros que coincidan con los filtros aplicados."
        ></app-empty-state>

        <app-claims-table
          *ngIf="claimsResult.items.length > 0"
          [claims]="claimsResult.items"
          (evaluate)="evaluateClaim($event)"
        ></app-claims-table>

        <div class="pagination-bar">
          <span>Página {{ claimsResult.page }} de {{ claimsResult.totalPages }} · {{ claimsResult.total }} siniestros</span>
          <label class="pagination-bar__limit">
            Mostrar
            <select [(ngModel)]="filters.limit" (ngModelChange)="onLimitChanged()">
              <option [value]="20">20</option>
              <option [value]="50">50</option>
              <option [value]="100">100</option>
            </select>
          </label>
          <div *ngIf="claimsResult.totalPages > 1">
            <app-button label="Anterior" variant="ghost" [disabled]="filters.page === 1" (pressed)="previousPage()"></app-button>
            <app-button label="Siguiente" variant="secondary" [disabled]="filters.page >= claimsResult.totalPages" (pressed)="nextPage()"></app-button>
          </div>
        </div>
      </ng-container>
    </section>
  `,
})
export class ClaimsListPageComponent implements OnInit {
  loading = signal(true);
  result = signal<PaginatedResult<Claim> | null>(null);

  filters: ClaimFilters = {
    page: 1,
    limit: 20,
    riskLevel: '',
    sortDirection: 'desc',
  };

  constructor(
    private claimsService: ClaimsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadClaims();
  }

  onFiltersChanged(filters: Partial<ClaimFilters>): void {
    this.filters = {
      ...this.filters,
      ...filters,
      page: 1,
    };
    this.loadClaims();
  }

  onLimitChanged(): void {
    this.filters = { ...this.filters, page: 1 };
    this.loadClaims();
  }

  nextPage(): void {
    this.filters = { ...this.filters, page: this.filters.page + 1 };
    this.loadClaims();
  }

  previousPage(): void {
    this.filters = { ...this.filters, page: Math.max(1, this.filters.page - 1) };
    this.loadClaims();
  }

  evaluateClaim(claimId: string): void {
    this.claimsService.evaluateClaim(claimId).subscribe({
      next: () => {
        this.notificationService.success('Siniestro evaluado correctamente.');
        this.loadClaims();
      },
    });
  }

  private loadClaims(): void {
    this.loading.set(true);
    this.claimsService.listClaims(this.filters).subscribe({
      next: (result) => {
        this.result.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.result.set(null);
        this.loading.set(false);
      },
    });
  }
}
