import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      class="app-button"
      [ngClass]="buttonClasses"
      [attr.aria-label]="ariaLabel || label"
      (click)="pressed.emit()"
    >
      <span *ngIf="loading" class="button-spinner" aria-hidden="true"></span>
      <span *ngIf="icon && !loading" class="app-button__icon" aria-hidden="true">{{ icon }}</span>
      <span>{{ loading ? loadingLabel : label }}</span>
    </button>
  `,
})
export class AppButtonComponent {
  @Input() label = 'Aceptar';
  @Input() ariaLabel?: string;
  @Input() icon?: string;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() loadingLabel = 'Procesando...';
  @Output() pressed = new EventEmitter<void>();

  get buttonClasses(): Record<string, boolean> {
    return {
      [`app-button--${this.variant}`]: true,
      [`app-button--${this.size}`]: true,
    };
  }
}
