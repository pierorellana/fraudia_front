import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Rule } from '../../models/rule.model';

@Component({
  selector: 'app-rule-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rule-detail-card app-card" *ngIf="rule">

      <div class="rule-detail-card__header">
        <div class="rule-detail-card__meta">
          <span class="rule-detail-card__code">{{ rule.code }}</span>
          <span class="rule-detail-card__type">{{ rule.ruleType }}</span>
        </div>
        <div>
          <h3 class="rule-detail-card__name">{{ rule.name }}</h3>
          <p class="rule-detail-card__desc">{{ rule.description }}</p>
        </div>
      </div>

      <div class="rule-detail-card__body">
        <p class="rule-detail-card__section-label">Condiciones de evaluación</p>
        <div class="rule-conditions">
          <div *ngFor="let cond of rule.conditions; let i = index" class="rule-condition">
            <span class="rule-condition__index">{{ i + 1 }}</span>
            <div class="rule-condition__content">
              <strong>{{ cond.name }}</strong>
              <p>{{ cond.resultDescription }}</p>
              <code>{{ cond.evaluatedField }} {{ cond.operator }}
                <ng-container *ngIf="cond.minValue !== undefined && cond.minValue !== null"> {{ cond.minValue }}</ng-container>
                <ng-container *ngIf="cond.maxValue !== undefined && cond.maxValue !== null"> {{ cond.maxValue }}</ng-container>
              </code>
            </div>
            <span class="rule-condition__pts">+{{ cond.points }} pts</span>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class RuleDetailComponent {
  @Input() rule: Rule | null = null;
}
