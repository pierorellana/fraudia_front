import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBadgeComponent } from '../../../../shared/components/badge/app-badge.component';
import { Rule } from '../../models/rule.model';

@Component({
  selector: 'app-rules-table',
  standalone: true,
  imports: [CommonModule, AppBadgeComponent],
  template: `
    <div class="rules-grid">
      <button *ngFor="let rule of rules" type="button" class="rule-card" (click)="ruleSelected.emit(rule)">
        <div class="rule-card__header">
          <span>{{ rule.code }}</span>
          <app-badge [label]="rule.active ? 'Activa' : 'Inactiva'" [variant]="rule.active ? 'success' : 'warning'"></app-badge>
        </div>
        <strong>{{ rule.name }}</strong>
        <p>{{ rule.description }}</p>
        <div class="rule-card__meta">
          <span>{{ rule.category }}</span>
          <b>{{ rule.maxScore }} pts</b>
        </div>
      </button>
    </div>
  `,
})
export class RulesTableComponent {
  @Input() rules: Rule[] = [];
  @Output() ruleSelected = new EventEmitter<Rule>();
}
