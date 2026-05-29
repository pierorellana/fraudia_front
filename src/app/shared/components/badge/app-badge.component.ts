import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeVariant } from '../../../core/models/common.model';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="app-badge" [ngClass]="'app-badge--' + variant">
      {{ label }}
    </span>
  `,
})
export class AppBadgeComponent {
  @Input() label = '';
  @Input() variant: BadgeVariant = 'neutral';
}
