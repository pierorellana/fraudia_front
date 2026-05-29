import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppButtonComponent } from '../../../../shared/components/button/app-button.component';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';
import { AppCardComponent } from '../../../../shared/components/card/app-card.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { ScoringService } from '../../../claims/services/scoring.service';
import { UploadService } from '../../services/upload.service';
import { UploadDatasetResponse } from '../../models/upload.model';
import { UploadSummaryComponent } from '../../components/upload-summary/upload-summary.component';
import { UploadErrorsComponent } from '../../components/upload-errors/upload-errors.component';

@Component({
  selector: 'app-upload-dataset-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppButtonComponent,
    AppCardComponent,
    FileUploadComponent,
    UploadSummaryComponent,
    UploadErrorsComponent,
  ],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <p class="page-kicker">Ingesta de datos</p>
          <h1>Cargar dataset</h1>
          <span>Importa archivos CSV, XLSX o XLSM para activar el análisis de riesgo.</span>
        </div>
      </header>

      <!-- Upload card -->
      <div class="upload-card app-card">

        <div class="upload-card__header">
          <div class="upload-card__header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          </div>
          <div>
            <strong>Seleccionar archivo</strong>
            <span>Carga segura</span>
          </div>
        </div>

        <div class="upload-card__body">

          <!-- Left: settings -->
          <div class="upload-card__settings">
            <label class="field">
              <span>Formato del archivo</span>
              <select [(ngModel)]="datasetType">
                <option value="auto">Detectar automáticamente</option>
                <option value="siniestros">Siniestros</option>
                <option value="polizas">Pólizas</option>
                <option value="asegurados">Asegurados</option>
                <option value="proveedores">Proveedores</option>
                <option value="vehiculos">Vehículos</option>
                <option value="documentos">Documentos</option>
              </select>
            </label>

            <div class="upload-info-block">
              <p>Formatos soportados</p>
              <div class="upload-format-badges">
                <span>CSV</span>
                <span>XLSX</span>
                <span>XLSM</span>
              </div>
            </div>

            <div class="upload-info-block">
              <p>Tamaño máximo</p>
              <span>50 MB por archivo</span>
            </div>
          </div>

          <!-- Right: dropzone -->
          <div class="upload-card__dropzone">
            <app-file-upload
              [maxFileSize]="52428800"
              (fileSelected)="onFileSelected($event)"
              (fileCleared)="onFileCleared()"
            ></app-file-upload>
          </div>

        </div>

        <div class="upload-card__actions">
          <app-button
            label="Cargar dataset"
            loadingLabel="Cargando..."
            [disabled]="!selectedFile()"
            [loading]="uploading()"
            (pressed)="uploadDataset()"
          ></app-button>
        </div>

        <div class="upload-card__footer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>Transferencia cifrada · los datos no se almacenan en texto plano</span>
        </div>
      </div>

      <!-- Results -->
      <app-card *ngIf="uploadResult() as result" title="Resumen de carga" eyebrow="Resultado del procesamiento">
        <app-upload-summary [result]="result"></app-upload-summary>
        <app-upload-errors [errors]="result.errors"></app-upload-errors>
        <div class="actions-row">
          <app-button
            label="Ejecutar evaluación batch"
            variant="success"
            [loading]="evaluatingBatch()"
            loadingLabel="Evaluando..."
            (pressed)="runBatchAssessment(result)"
          ></app-button>
        </div>
      </app-card>
    </section>
  `,
})
export class UploadDatasetPageComponent {
  selectedFile = signal<File | null>(null);
  uploadResult = signal<UploadDatasetResponse | null>(null);
  uploading = signal(false);
  evaluatingBatch = signal(false);
  datasetType = 'auto';

  constructor(
    private uploadService: UploadService,
    private scoringService: ScoringService,
    private notificationService: NotificationService,
  ) {}

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
    this.uploadResult.set(null);
  }

  onFileCleared(): void {
    this.selectedFile.set(null);
    this.uploadResult.set(null);
  }

  uploadDataset(): void {
    const file = this.selectedFile();
    if (!file) return;
    this.uploading.set(true);
    this.uploadService.uploadDataset(file, this.datasetType).subscribe({
      next: (result) => {
        this.uploadResult.set(result);
        this.uploading.set(false);
        this.notificationService.success('Dataset cargado correctamente.');
      },
      error: () => this.uploading.set(false),
    });
  }

  runBatchAssessment(result: UploadDatasetResponse): void {
    this.evaluatingBatch.set(true);
    this.scoringService.confirmImportedDatasetAssessment(result.createdAssessments).subscribe({
      next: (response) => {
        this.evaluatingBatch.set(false);
        this.notificationService.success(response.message);
      },
      error: () => this.evaluatingBatch.set(false),
    });
  }
}
