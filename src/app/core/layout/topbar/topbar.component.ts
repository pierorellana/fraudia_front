import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="topbar">
      <div class="topbar__left">
        <button type="button" (click)="onToggleSidebar()" class="topbar__menu" aria-label="Abrir menú">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div>
          <p class="topbar__eyebrow">Detector de posibles fraudes</p>
          <h2>Siniestros con inteligencia artificial</h2>
        </div>
      </div>

      <div class="topbar__user">
        <span>Supervisor demo</span>
        <div class="user-avatar" aria-hidden="true">SD</div>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}
