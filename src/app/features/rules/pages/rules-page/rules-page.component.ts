import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { Rule } from '../../models/rule.model';
import { RulesService } from '../../services/rules.service';
import { RuleDetailComponent } from '../../components/rule-detail/rule-detail.component';

@Component({
  selector: 'app-rules-page',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, RuleDetailComponent],
  template: `
    <section class="page">
      <ng-container *ngIf="!loading() && rules() as rulesList">
        <header class="page-header">
          <div>
            <p class="page-kicker">Motor de reglas</p>
            <h1>Reglas de evaluación</h1>
            <span>Condiciones, categorías y puntajes usados por el motor de riesgo.</span>
          </div>
        </header>

        <div class="rules-card" *ngIf="rulesList.length > 0">

          <!-- Count header -->
          <div class="rules-card__top">
            <span>{{ activeCount() }} REGLAS ACTIVAS</span>
          </div>

          <!-- Column headers -->
          <div class="rules-cols" aria-hidden="true">
            <span></span>
            <span>REGLA</span>
            <span>CATEGORÍA</span>
            <span>PUNTAJE</span>
            <span>ESTADO</span>
          </div>

          <!-- Rows -->
          <div class="rules-list">
            <div
              *ngFor="let rule of sortedRules()"
              class="rules-row"
              [class.is-selected]="selectedRule()?.id === rule.id"
              (click)="toggleRule(rule)"
              [attr.role]="'button'"
              [attr.aria-expanded]="selectedRule()?.id === rule.id"
            >
              <span class="rules-row__code">{{ rule.code }}</span>

              <div class="rules-row__name">
                <strong>{{ rule.name }}</strong>
                <span>{{ rule.description }}</span>
              </div>

              <div class="rules-row__category">
                <span class="rules-cat-badge">{{ rule.category }}</span>
              </div>

              <div class="rules-row__score" [style.color]="scoreColor(rule.maxScore)">
                {{ rule.maxScore }}<small> pts</small>
              </div>

              <div class="rules-row__status" [class.is-active]="rule.active">
                {{ rule.active ? 'Activa' : 'Inactiva' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Detail panel -->
        <app-rule-detail *ngIf="selectedRule()" [rule]="selectedRule()"></app-rule-detail>

        <app-empty-state
          *ngIf="rulesList.length === 0"
          title="No hay reglas configuradas"
          message="El motor de reglas no tiene condiciones activas."
        ></app-empty-state>
      </ng-container>
    </section>
  `,
})
export class RulesPageComponent implements OnInit {
  loading = signal(true);
  rules = signal<Rule[] | null>(null);
  selectedRule = signal<Rule | null>(null);

  sortedRules = computed(() => [...(this.rules() ?? [])].sort((a, b) => b.maxScore - a.maxScore));
  activeCount = computed(() => (this.rules() ?? []).filter((r) => r.active).length);

  constructor(private rulesService: RulesService) {}

  ngOnInit(): void {
    this.rulesService.listRules().subscribe({
      next: (rules) => {
        this.rules.set(rules);
        // Auto-selecciona la regla de mayor puntaje
        const sorted = [...rules].sort((a, b) => b.maxScore - a.maxScore);
        this.selectedRule.set(sorted[0] ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleRule(rule: Rule): void {
    this.selectedRule.set(this.selectedRule()?.id === rule.id ? null : rule);
  }

  scoreColor(score: number): string {
    if (score >= 28) return 'var(--color-red)';
    if (score >= 20) return 'var(--color-orange)';
    if (score >= 15) return 'var(--color-yellow)';
    return 'var(--color-green)';
  }
}
