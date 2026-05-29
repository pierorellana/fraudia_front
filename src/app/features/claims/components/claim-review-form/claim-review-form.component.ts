import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppButtonComponent } from '../../../../shared/components/button/app-button.component';
import { AppCardComponent } from '../../../../shared/components/card/app-card.component';
import { HumanReviewDecision, ReviewRequest } from '../../models/review.model';

@Component({
  selector: 'app-claim-review-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppButtonComponent, AppCardComponent],
  template: `
    <app-card title="Revisión humana" eyebrow="Decisión del supervisor" [highlighted]="true">
      <form class="review-form" [formGroup]="form" (ngSubmit)="submit()">
        <label class="field">
          <span>Decisión</span>
          <select formControlName="decision">
            <option value="approve">Aprobar continuidad</option>
            <option value="reject">Rechazar por inconsistencias</option>
            <option value="escalate">Escalar a antifraude</option>
            <option value="request_information">Solicitar información adicional</option>
          </select>
        </label>
        <label class="field">
          <span>Estado de revisión</span>
          <select formControlName="reviewStatus">
            <option value="En revisión">En revisión</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Escalado">Escalado</option>
            <option value="Pendiente de documentos">Pendiente de documentos</option>
          </select>
        </label>
        <label class="field">
          <span>Supervisor</span>
          <input type="text" formControlName="reviewer" />
        </label>
        <label class="field field--full">
          <span>Comentario</span>
          <textarea rows="4" formControlName="comment" placeholder="Describe la decisión tomada..."></textarea>
        </label>
        <app-button label="Registrar revisión" type="submit" [disabled]="form.invalid"></app-button>
      </form>
    </app-card>
  `,
})
export class ClaimReviewFormComponent {
  @Output() reviewSubmitted = new EventEmitter<ReviewRequest>();

  form = this.formBuilder.nonNullable.group({
    decision: ['escalate'],
    reviewStatus: ['En revisión', Validators.required],
    reviewer: ['Supervisor demo', Validators.required],
    comment: ['', [Validators.required, Validators.minLength(5)]],
  });

  constructor(private formBuilder: FormBuilder) {}

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    this.reviewSubmitted.emit({
      decision: value.decision as HumanReviewDecision,
      reviewStatus: value.reviewStatus,
      reviewer: value.reviewer,
      comment: value.comment,
    });
    this.form.patchValue({ comment: '' });
  }
}
