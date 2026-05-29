import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadError } from '../../models/upload.model';

@Component({
  selector: 'app-upload-errors',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="error-list" *ngIf="errors.length > 0">
      <h3>Errores por fila</h3>
      <div *ngFor="let error of errors" class="error-list__item">
        <strong>Fila {{ error.row }}</strong>
        <span>{{ error.field }}</span>
        <p>{{ error.message }}</p>
      </div>
    </section>
  `,
})
export class UploadErrorsComponent {
  @Input() errors: UploadError[] = [];
}
