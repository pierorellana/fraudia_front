import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="app-card" [ngClass]="cardClasses">
      <div *ngIf="title || eyebrow" class="app-card__header">
        <p *ngIf="eyebrow" class="app-card__eyebrow">{{ eyebrow }}</p>
        <h3 *ngIf="title">{{ title }}</h3>
      </div>
      <ng-content></ng-content>
    </article>
  `,
})
export class AppCardComponent {
  @Input() title?: string;
  @Input() eyebrow?: string;
  @Input() highlighted = false;
  @Input() compact = false;
  @Input() noPadding = false;

  get cardClasses(): Record<string, boolean> {
    return {
      'app-card--highlighted': this.highlighted,
      'app-card--compact': this.compact,
      'app-card--no-padding': this.noPadding,
    };
  }
}
