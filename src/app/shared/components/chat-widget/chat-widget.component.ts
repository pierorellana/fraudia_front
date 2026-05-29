import { Component, ElementRef, OnInit, ViewChild, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AgentService } from '../../../features/agent/services/agent.service';
import { AgentQueryRequest, ChatMessage, SuggestedQuestion } from '../../../features/agent/models/agent.model';
import { ChatMessageComponent } from '../../../features/agent/components/chat-message/chat-message.component';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ChatMessageComponent],
  template: `
    <button
      class="chat-fab"
      type="button"
      [attr.aria-label]="isOpen() ? 'Cerrar asistente' : 'Abrir asistente IA'"
      (click)="toggleOpen()"
    >
      <svg *ngIf="!isOpen()" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <svg *ngIf="isOpen()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>

    <div class="chat-widget" *ngIf="isOpen()">
      <header class="chat-widget__header">
        <div class="chat-widget__header-info">
          <div class="chat-widget__avatar">IA</div>
          <div>
            <strong>Asistente IA — Siniestros</strong>
            <small><span class="chat-status-dot"></span> En línea · responde al instante</small>
          </div>
        </div>
        <button class="chat-widget__close" type="button" aria-label="Cerrar" (click)="toggleOpen()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </header>

      <div class="chat-widget__body" #chatBody>
        <div class="chat-widget__context-bar" [class.chat-widget__context-bar--claim]="activeClaimId()">
          <span>{{ activeClaimId() ? 'Contexto: ' + activeClaimId() : 'Contexto: Global' }}</span>
          <button
            *ngIf="manualClaimId()"
            type="button"
            aria-label="Quitar contexto manual"
            (click)="clearManualContext()"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div *ngIf="messages().length === 0" class="chat-widget__welcome">
          <div class="chat-message">
            <div>
              <p>¡Hola! Soy tu asistente de siniestros 🤖. Puedo ayudarte a priorizar casos, detectar patrones o explicar un siniestro por código.</p>
              <p style="margin: 8px 0 0">¿En qué puedo ayudarte hoy?</p>
            </div>
          </div>
          <div class="chat-widget__quick-actions" *ngIf="quickQuestions().length">
            <button
              *ngFor="let q of quickQuestions()"
              class="chat-widget__quick-btn"
              type="button"
              (click)="sendQuestion(q.question)"
            >
              {{ q.question }}
            </button>
          </div>
        </div>

        <app-chat-message *ngFor="let msg of messages()" [message]="msg"></app-chat-message>

        <article *ngIf="loading()" class="chat-message chat-message--loading" aria-label="El agente está redactando la respuesta">
          <div>
            <div class="chat-message__skeleton">
              <span class="chat-message__skeleton-line chat-message__skeleton-line--wide"></span>
              <span class="chat-message__skeleton-line"></span>
              <span class="chat-message__skeleton-line chat-message__skeleton-line--short"></span>
            </div>
          </div>
        </article>
      </div>

      <footer class="chat-widget__footer">
        <form [formGroup]="form" (ngSubmit)="submit()">
          <input
            formControlName="question"
            maxlength="800"
            [placeholder]="activeClaimId() ? 'Pregunta sobre ' + activeClaimId() + '...' : 'Pregunta al asistente...'"
            autocomplete="off"
          />
          <button type="submit" [disabled]="form.invalid || loading()" aria-label="Enviar">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </footer>
    </div>
  `,
})
export class ChatWidgetComponent implements OnInit {
  @ViewChild('chatBody') chatBody?: ElementRef<HTMLDivElement>;

  isOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  suggestedQuestions = signal<SuggestedQuestion[]>([]);
  loading = signal(false);
  routeClaimId = signal<string | null>(null);
  manualClaimId = signal<string | null>(null);
  activeClaimId = computed(() => this.manualClaimId() ?? this.routeClaimId());
  quickQuestions = computed(() => {
    const claimId = this.activeClaimId();

    if (!claimId) {
      return this.suggestedQuestions().slice(0, 4);
    }

    return [
      { id: 'claim-risk', question: 'Explícame el riesgo de este siniestro' },
      { id: 'claim-next-steps', question: '¿Qué debo revisar primero?' },
      { id: 'claim-executive', question: 'Dame una explicación ejecutiva' },
      { id: 'claim-alerts', question: '¿Qué alertas son más importantes?' },
    ];
  });

  form = this.fb.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(800)]],
  });

  private readonly sessionsByContext = new Map<string, string>();
  private readonly globalContextKey = 'global';
  private readonly claimCodePattern = /\bSIN-\d+\b/i;
  private readonly claimRoutePattern = /\/claims\/([^/?#]+)/i;
  private readonly timeoutResponse =
    'El agente tardó más de lo esperado y detuve la consulta. Ya puedes enviar otra pregunta o intentarlo de nuevo.';
  private readonly unavailableResponse =
    'No pude completar la respuesta. Ya puedes enviar otra pregunta o reformular la consulta.';

  constructor(
    private fb: FormBuilder,
    private agentService: AgentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.agentService.getSuggestedQuestions().subscribe((q) => this.suggestedQuestions.set(q));
    this.updateRouteContext(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.updateRouteContext(event.urlAfterRedirects));
  }

  toggleOpen(): void {
    this.isOpen.update((v) => !v);
  }

  submit(): void {
    if (this.form.invalid) return;
    const question = this.form.getRawValue().question.trim();
    this.form.reset({ question: '' });
    this.sendQuestion(question);
  }

  sendQuestion(question: string): void {
    if (this.loading()) return;

    const userMsg: ChatMessage = {
      id: this.createMessageId(),
      role: 'user',
      content: question,
      createdAt: new Date(),
    };
    this.messages.update((msgs) => [...msgs, userMsg]);
    this.loading.set(true);
    this.scrollToBottom();

    const claimId = this.resolveQuestionClaimId(question);
    const request: AgentQueryRequest = {
      question,
      claimId,
      sessionId: this.getSessionIdForContext(claimId),
      useLlm: true,
    };

    this.agentService.query(request).subscribe({
      next: (response) => {
        this.persistSessionForContext(claimId, response.sessionId);
        this.appendAssistantMessage(response.answer, response.relatedData);
        this.loading.set(false);
        this.scrollToBottom();
      },
      error: (error) => {
        this.appendAssistantMessage(this.resolveUnavailableResponse(error));
        this.loading.set(false);
        this.scrollToBottom();
      },
    });
  }

  clearManualContext(): void {
    this.manualClaimId.set(null);
  }

  private appendAssistantMessage(content: string, relatedData?: string[]): void {
    this.messages.update((msgs) => [
      ...msgs,
      {
        id: this.createMessageId(),
        role: 'assistant',
        content,
        relatedData,
        createdAt: new Date(),
      },
    ]);
  }

  private createMessageId(): string {
    return `${Date.now()}-${Math.random()}`;
  }

  private resolveUnavailableResponse(error: unknown): string {
    return this.isTimeoutError(error) ? this.timeoutResponse : this.unavailableResponse;
  }

  private isTimeoutError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'name' in error && error.name === 'TimeoutError';
  }

  private resolveQuestionClaimId(question: string): string | null {
    const claimCode = this.extractClaimCode(question);
    if (claimCode) {
      this.manualClaimId.set(claimCode);
      return claimCode;
    }

    return this.activeClaimId();
  }

  private getSessionIdForContext(claimId: string | null): string | null {
    const key = this.contextKey(claimId);
    const storedInMemory = this.sessionsByContext.get(key);

    if (storedInMemory) {
      return storedInMemory;
    }

    return claimId ? this.agentService.getStoredSessionId(claimId) : null;
  }

  private persistSessionForContext(claimId: string | null, sessionId: string | null | undefined): void {
    if (!sessionId) {
      return;
    }

    this.sessionsByContext.set(this.contextKey(claimId), sessionId);
  }

  private contextKey(claimId: string | null): string {
    return claimId ?? this.globalContextKey;
  }

  private updateRouteContext(url: string): void {
    const nextRouteClaimId = this.extractClaimFromUrl(url);
    const previousRouteClaimId = this.routeClaimId();

    this.routeClaimId.set(nextRouteClaimId);

    if (nextRouteClaimId && nextRouteClaimId !== previousRouteClaimId) {
      this.manualClaimId.set(null);
    }
  }

  private extractClaimFromUrl(url: string): string | null {
    const decodedUrl = decodeURIComponent(url);
    const pathMatch = decodedUrl.match(this.claimRoutePattern);

    if (pathMatch?.[1]) {
      return this.normalizeClaimId(pathMatch[1]);
    }

    const queryString = decodedUrl.split('?')[1]?.split('#')[0] ?? '';
    const queryParams = new URLSearchParams(queryString);
    return this.normalizeClaimId(queryParams.get('claim_id'));
  }

  private extractClaimCode(value: string): string | null {
    return this.normalizeClaimId(value.match(this.claimCodePattern)?.[0] ?? null);
  }

  private normalizeClaimId(value: string | null | undefined): string | null {
    const normalized = value?.trim();
    return normalized ? normalized.toUpperCase() : null;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    }, 60);
  }
}
