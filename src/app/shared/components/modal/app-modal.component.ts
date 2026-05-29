import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppButtonComponent } from '../button/app-button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, AppButtonComponent],
  template: `
    <div *ngIf="isOpen" class="modal-backdrop" (click)="close.emit()">
      <section class="modal-panel" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
        <header class="modal-panel__header">
          <h2>{{ title }}</h2>
          <button type="button" (click)="close.emit()" aria-label="Cerrar">×</button>
        </header>
        <div class="modal-panel__body">
          <ng-content></ng-content>
        </div>
        <footer class="modal-panel__footer">
          <app-button [label]="cancelLabel" variant="ghost" (pressed)="close.emit()"></app-button>
          <app-button
            *ngIf="showConfirm"
            [label]="confirmLabel"
            (pressed)="confirm.emit()"
          ></app-button>
        </footer>
      </section>
    </div>
  `,
})
export class AppModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Diálogo';
  @Input() showConfirm = true;
  @Input() confirmLabel = 'Aceptar';
  @Input() cancelLabel = 'Cancelar';
  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
