import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-spinner" role="status" aria-live="polite" [attr.aria-label]="message">
      <div class="ai-loader" aria-hidden="true">
        <span class="ai-loader__signal ai-loader__signal--one"></span>
        <span class="ai-loader__signal ai-loader__signal--two"></span>
        <div class="ai-loader__robot">
          <span class="ai-loader__antenna"></span>
          <div class="ai-loader__head">
            <span class="ai-loader__eye"></span>
            <span class="ai-loader__eye"></span>
          </div>
          <div class="ai-loader__neck"></div>
          <div class="ai-loader__body">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="ai-loader__arm ai-loader__arm--left"></span>
          <span class="ai-loader__arm ai-loader__arm--right"></span>
          <span class="ai-loader__leg ai-loader__leg--left"></span>
          <span class="ai-loader__leg ai-loader__leg--right"></span>
        </div>
        <span class="ai-loader__shadow"></span>
      </div>
      <p *ngIf="message" class="loading-spinner__message">
        {{ message }}<span class="loading-spinner__dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span>
      </p>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() message = 'Analizando información';
}
