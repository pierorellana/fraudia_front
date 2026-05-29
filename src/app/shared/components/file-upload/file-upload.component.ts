import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-upload">

      <!-- Dropzone (shown when no file selected) -->
      <button
        *ngIf="!selectedFile"
        type="button"
        class="file-upload__dropzone"
        [class.is-dragging]="isDragging"
        (click)="fileInput.click()"
        (drop)="onDrop($event)"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
      >
        <input #fileInput type="file" [accept]="acceptedFormats" (change)="onFileInputChange($event)" />

        <div class="file-upload__icon-wrap">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 16 12 12 8 16"/>
            <line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
          </svg>
        </div>

        <strong class="file-upload__title">
          {{ isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo aquí' }}
        </strong>
        <span class="file-upload__or">
          o <span class="file-upload__link">selecciona desde tu equipo</span>
        </span>
        <small>CSV, XLSX o XLSM · máx. {{ maxFileSizeMb }} MB</small>
      </button>

      <!-- File selected state -->
      <div *ngIf="selectedFile" class="file-upload__selected">
        <div class="file-upload__file-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="file-upload__file-info">
          <strong>{{ selectedFile.name }}</strong>
          <span>{{ formatFileSize(selectedFile.size) }}</span>
        </div>
        <button type="button" class="file-upload__clear" (click)="clearFile()" aria-label="Quitar archivo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <p *ngIf="errorMessage" class="form-error">{{ errorMessage }}</p>
    </div>
  `,
})
export class FileUploadComponent {
  @Input() acceptedFormats = '.csv,.xlsx,.xlsm';
  @Input() maxFileSize = 52_428_800; // 50 MB default
  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileCleared = new EventEmitter<void>();

  selectedFile: File | null = null;
  isDragging = false;
  errorMessage = '';

  get maxFileSizeMb(): number {
    return Math.round(this.maxFileSize / 1_048_576);
  }

  onFileInputChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.item(0);
    if (file) this.handleFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files.item(0);
    if (file) this.handleFile(file);
  }

  clearFile(): void {
    this.selectedFile = null;
    this.errorMessage = '';
    this.fileCleared.emit();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 KB';
    const units = ['Bytes', 'KB', 'MB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  private handleFile(file: File): void {
    this.errorMessage = '';
    if (file.size > this.maxFileSize) {
      this.errorMessage = `El archivo supera el límite de ${this.maxFileSizeMb} MB.`;
      return;
    }
    const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
    if (!this.acceptedFormats.split(',').map((s) => s.trim()).includes(ext)) {
      this.errorMessage = 'Formato no válido. Usa CSV, XLSX o XLSM.';
      return;
    }
    this.selectedFile = file;
    this.fileSelected.emit(file);
  }
}
