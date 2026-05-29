import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppButtonComponent } from '../button/app-button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, AppButtonComponent],
  template: `
    <div class="empty-state">
      <div class="empty-state__mark" aria-hidden="true">{{ icon || 'i' }}</div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <app-button
        *ngIf="actionLabel"
        [label]="actionLabel"
        variant="secondary"
        (pressed)="action.emit()"
      ></app-button>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon?: string;
  @Input() title = 'No hay información disponible';
  @Input() message = 'No hay datos para mostrar en este momento.';
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();
}
