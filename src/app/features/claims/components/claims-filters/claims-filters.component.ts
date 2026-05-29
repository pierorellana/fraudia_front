import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { RiskLevel } from '../../../../core/models/common.model';
import { ClaimFilters } from '../../models/claim.model';

type FilterKey = 'riskLevel' | 'branch' | 'dateFrom' | 'dateTo';

@Component({
  selector: 'app-claims-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="cf-header">
      <div class="cf-title">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
        <strong>Filtros</strong>
      </div>
      <span class="cf-count" *ngIf="total !== null">{{ total }} casos</span>
    </div>

    <div class="cf-grid" [formGroup]="form">
      <label class="cf-field">
        <span>Nivel de riesgo</span>
        <select formControlName="riskLevel">
          <option value="">Todos</option>
          <option value="verde">Bajo riesgo</option>
          <option value="amarillo">Medio riesgo</option>
          <option value="rojo">Alto riesgo</option>
        </select>
      </label>

      <label class="cf-field">
        <span>Ramo</span>
        <input type="text" formControlName="branch" placeholder="Vehículos, Vida..." />
      </label>

      <label class="cf-field">
        <span>Rango de fechas</span>
        <div class="cf-date-range">
          <input type="date" formControlName="dateFrom" />
          <input type="date" formControlName="dateTo" />
        </div>
      </label>

      <label class="cf-field">
        <span>Ordenar por</span>
        <select formControlName="sortDirection">
          <option value="desc">Mayor a menor</option>
          <option value="asc">Menor a mayor</option>
        </select>
      </label>
    </div>

    <div class="cf-active" *ngIf="activeFilters.length > 0">
      <span>Activos:</span>
      <button
        *ngFor="let f of activeFilters"
        class="cf-tag"
        type="button"
        (click)="removeFilter(f.key)"
      >
        {{ f.label }} <span aria-hidden="true">×</span>
      </button>
    </div>
  `,
})
export class ClaimsFiltersComponent implements OnInit, OnDestroy {
  @Input() total: number | null = null;
  @Output() filtersChanged = new EventEmitter<Partial<ClaimFilters>>();

  private destroy$ = new Subject<void>();

  form = this.fb.nonNullable.group({
    riskLevel: [''],
    branch: [''],
    dateFrom: [''],
    dateTo: [''],
    sortDirection: ['desc'],
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(debounceTime(350), takeUntil(this.destroy$))
      .subscribe(() => this.emit());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get activeFilters(): { key: FilterKey; label: string }[] {
    const v = this.form.getRawValue();
    const result: { key: FilterKey; label: string }[] = [];
    if (v.riskLevel) result.push({ key: 'riskLevel', label: this.riskLabel(v.riskLevel) });
    if (v.branch)    result.push({ key: 'branch',    label: v.branch });
    if (v.dateFrom)  result.push({ key: 'dateFrom',  label: `Desde: ${v.dateFrom}` });
    if (v.dateTo)    result.push({ key: 'dateTo',    label: `Hasta: ${v.dateTo}` });
    return result;
  }

  removeFilter(key: FilterKey): void {
    this.form.patchValue({ [key]: '' });
  }

  private emit(): void {
    const v = this.form.getRawValue();
    this.filtersChanged.emit({
      riskLevel: v.riskLevel as RiskLevel | '',
      branch: v.branch,
      dateFrom: v.dateFrom,
      dateTo: v.dateTo,
      sortDirection: v.sortDirection as 'asc' | 'desc',
    });
  }

  private riskLabel(level: string): string {
    const map: Record<string, string> = {
      verde: 'Bajo riesgo', amarillo: 'Medio riesgo', rojo: 'Alto riesgo',
    };
    return map[level] ?? level;
  }
}
