import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { ChatMessage } from '../../models/agent.model';

type ChatMessageBlockKind = 'title' | 'heading' | 'paragraph' | 'bullet' | 'numbered';

interface ChatMessageBlock {
  kind: ChatMessageBlockKind;
  text: string;
  label?: string;
  body?: string;
  index?: string;
}

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, DateFormatPipe],
  template: `
    <article class="chat-message" [class.chat-message--user]="message.role === 'user'">
      <div>
        <p *ngIf="message.role === 'user'; else assistantMessage">{{ message.content }}</p>

        <ng-template #assistantMessage>
          <div class="chat-message__formatted">
            <ng-container *ngFor="let block of formattedBlocks">
              <h3 *ngIf="block.kind === 'title'">{{ block.text }}</h3>
              <h4 *ngIf="block.kind === 'heading'">{{ block.text }}</h4>

              <p *ngIf="block.kind === 'paragraph'">
                <ng-container *ngTemplateOutlet="textWithLabel; context: { block: block }"></ng-container>
              </p>

              <div *ngIf="block.kind === 'bullet'" class="chat-message__list-item">
                <span class="chat-message__bullet"></span>
                <p><ng-container *ngTemplateOutlet="textWithLabel; context: { block: block }"></ng-container></p>
              </div>

              <div *ngIf="block.kind === 'numbered'" class="chat-message__list-item chat-message__list-item--numbered">
                <span class="chat-message__number">{{ block.index }}</span>
                <p><ng-container *ngTemplateOutlet="textWithLabel; context: { block: block }"></ng-container></p>
              </div>
            </ng-container>
          </div>
        </ng-template>

        <ng-template #textWithLabel let-block="block">
          <strong *ngIf="block.label">{{ block.label }}</strong>
          <ng-container *ngIf="block.label">: </ng-container>{{ block.body || block.text }}
        </ng-template>

        <span class="chat-message__time">{{ message.createdAt | dateFormat: 'time' }}</span>
        <div *ngIf="sourceLabels.length" class="chat-message__sources">
          <span class="chat-message__sources-label">Respuesta basada en:</span>
          <small *ngFor="let item of sourceLabels">{{ item }}</small>
        </div>
      </div>
    </article>
  `,
})
export class ChatMessageComponent implements OnChanges {
  @Input({ required: true }) message!: ChatMessage;

  formattedBlocks: ChatMessageBlock[] = [];
  sourceLabels: string[] = [];

  private readonly headings = new Set([
    'Datos del caso',
    'Estado de riesgo',
    'Lectura ejecutiva',
    'Hallazgos principales',
    'Siguientes pasos recomendados',
    'Nota',
  ]);

  private readonly sourceLabelByName: Record<string, string> = {
    siniestros: 'siniestro',
    scores_fraude: 'score',
    alertas: 'alertas',
    polizas: 'poliza',
    asegurados: 'asegurado',
    proveedores: 'proveedor',
    documentos: 'documentos',
    vehiculos: 'vehiculo',
  };

  private readonly hiddenSources = new Set(['sesiones_chat', 'mensajes_chat']);

  ngOnChanges(): void {
    this.formattedBlocks = this.parseContent(this.message.content);
    this.sourceLabels = this.formatSources(this.message.relatedData ?? []);
  }

  private parseContent(content: string): ChatMessageBlock[] {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    return lines.map((line, index) => this.parseLine(line, index));
  }

  private parseLine(line: string, index: number): ChatMessageBlock {
    if (index === 0) {
      return { kind: 'title', text: line };
    }

    if (this.headings.has(line)) {
      return { kind: 'heading', text: line };
    }

    const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      return {
        kind: 'numbered',
        index: numberedMatch[1],
        text: numberedMatch[2],
        ...this.splitLabel(numberedMatch[2]),
      };
    }

    const bulletMatch = line.match(/^-\s+(.+)$/);
    if (bulletMatch) {
      return {
        kind: 'bullet',
        text: bulletMatch[1],
        ...this.splitLabel(bulletMatch[1]),
      };
    }

    return {
      kind: 'paragraph',
      text: line,
      ...this.splitLabel(line),
    };
  }

  private splitLabel(text: string): Pick<ChatMessageBlock, 'label' | 'body'> {
    const match = text.match(/^([^:]{2,80}):\s+(.+)$/);
    if (!match) {
      return {};
    }

    return {
      label: match[1],
      body: match[2],
    };
  }

  private formatSources(sources: string[]): string[] {
    const labels = sources
      .filter((source) => !this.hiddenSources.has(source))
      .map((source) => this.sourceLabelByName[source] ?? source.replace(/_/g, ' '))
      .filter((source, index, all) => all.indexOf(source) === index);

    return labels;
  }
}
