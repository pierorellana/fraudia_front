import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadDatasetResponse } from '../../models/upload.model';

@Component({
  selector: 'app-upload-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="upload-summary">
      <div class="upload-summary__header">
        <span>Archivo procesado</span>
        <strong>{{ result.fileName }}</strong>
        <p>{{ result.message }}</p>
      </div>

      <div class="metric-grid metric-grid--compact">
        <article class="metric-card">
          <span>Total de filas</span>
          <strong>{{ result.totalRows }}</strong>
        </article>
        <article class="metric-card metric-card--green">
          <span>Filas válidas</span>
          <strong>{{ result.validRows }}</strong>
        </article>
        <article class="metric-card metric-card--red">
          <span>Filas inválidas</span>
          <strong>{{ result.invalidRows }}</strong>
        </article>
        <article class="metric-card metric-card--blue">
          <span>Evaluaciones</span>
          <strong>{{ result.createdAssessments }}</strong>
        </article>
      </div>

      <div class="dataset-grid">
        <div><span>Asegurados</span><strong>{{ result.createdInsureds }}</strong></div>
        <div><span>Pólizas</span><strong>{{ result.createdPolicies }}</strong></div>
        <div><span>Vehículos</span><strong>{{ result.createdVehicles }}</strong></div>
        <div><span>Proveedores</span><strong>{{ result.createdProviders }}</strong></div>
        <div><span>Siniestros</span><strong>{{ result.createdClaims }}</strong></div>
      </div>
    </section>
  `,
})
export class UploadSummaryComponent {
  @Input({ required: true }) result!: UploadDatasetResponse;
}
