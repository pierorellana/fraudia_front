import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

export type TableRow = Record<string, string | number | boolean | null | undefined>;

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="responsive-table" *ngIf="data.length > 0; else emptyTable">
      <table>
        <thead>
          <tr>
            <th *ngFor="let column of columns" [class.is-right]="column.align === 'right'">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of data">
            <td
              *ngFor="let column of columns"
              [attr.data-label]="column.label"
              [class.is-right]="column.align === 'right'"
            >
              {{ formatCell(row[column.key]) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ng-template #emptyTable>
      <p class="muted-text">{{ emptyMessage }}</p>
    </ng-template>
  `,
})
export class AppTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: TableRow[] = [];
  @Input() emptyMessage = 'No hay información disponible.';

  formatCell(value: TableRow[string]): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    return String(value);
  }
}
