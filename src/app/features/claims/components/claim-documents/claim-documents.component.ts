import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBadgeComponent } from '../../../../shared/components/badge/app-badge.component';
import { AppCardComponent } from '../../../../shared/components/card/app-card.component';
import { DocumentItem } from '../../models/claim.model';

@Component({
  selector: 'app-claim-documents',
  standalone: true,
  imports: [CommonModule, AppBadgeComponent, AppCardComponent],
  template: `
    <app-card title="Documentos" eyebrow="Soporte del reclamo">
      <div class="document-list" *ngIf="documents.length > 0; else noDocuments">
        <div *ngFor="let document of documents" class="document-item">
          <div>
            <strong>{{ document.documentType }}</strong>
            <span>{{ document.notes || document.status || 'Sin observaciones' }}</span>
          </div>
          <div>
            <app-badge [label]="document.delivered ? 'Entregado' : 'Pendiente'" [variant]="document.delivered ? 'success' : 'warning'"></app-badge>
            <app-badge [label]="document.legible ? 'Legible' : 'No legible'" [variant]="document.legible ? 'success' : 'danger'"></app-badge>
            <app-badge *ngIf="document.inconsistencyDetected" label="Inconsistente" variant="danger"></app-badge>
          </div>
        </div>
      </div>
      <ng-template #noDocuments>
        <p class="muted-text">No hay documentos registrados.</p>
      </ng-template>
    </app-card>
  `,
})
export class ClaimDocumentsComponent {
  @Input() documents: DocumentItem[] = [];
}
