import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AppCardComponent } from '../../../../shared/components/card/app-card.component';
import { AgentInputComponent } from '../../components/agent-input/agent-input.component';
import { ChatMessageComponent } from '../../components/chat-message/chat-message.component';
import { SuggestedQuestionsComponent } from '../../components/suggested-questions/suggested-questions.component';
import { AgentService } from '../../services/agent.service';
import { AgentQueryRequest, ChatMessage, SuggestedQuestion } from '../../models/agent.model';

@Component({
  selector: 'app-agent-chat-page',
  standalone: true,
  imports: [
    CommonModule,
    AppCardComponent,
    AgentInputComponent,
    ChatMessageComponent,
    SuggestedQuestionsComponent,
  ],
  template: `
    <section class="page agent-page">
      <header class="page-header">
        <div>
          <p class="page-kicker">Asistente analítico</p>
          <h1>Agente IA</h1>
          <span>Consulta señales, explicaciones y prioridades sin reemplazar la revisión humana.</span>
        </div>
      </header>

      <app-card *ngIf="activeClaimId()" title="Chat asociado a siniestro" eyebrow="Contexto activo" [highlighted]="true">
        <p class="body-text">
          Código visible: <strong>{{ activeClaimId() }}</strong>. La conversación conserva su sesión para continuar con el mismo contexto.
        </p>
      </app-card>

      <app-card title="Preguntas sugeridas" eyebrow="Inicio rápido">
        <app-suggested-questions [questions]="suggestedQuestions()" (questionSelected)="selectQuestion($event)"></app-suggested-questions>
      </app-card>

      <app-card title="Conversación" eyebrow="Consulta supervisada">
        <div class="chat-window">
          <p *ngIf="messages().length === 0" class="muted-text">Haz una pregunta al agente para comenzar.</p>
          <app-chat-message *ngFor="let message of messages()" [message]="message"></app-chat-message>
          <article *ngIf="loadingResponse()" class="chat-message chat-message--loading" aria-label="El agente está redactando la respuesta">
            <div>
              <div class="chat-message__skeleton">
                <span class="chat-message__skeleton-line chat-message__skeleton-line--wide"></span>
                <span class="chat-message__skeleton-line"></span>
                <span class="chat-message__skeleton-line chat-message__skeleton-line--short"></span>
              </div>
            </div>
          </article>
        </div>
        <div class="agent-meta">
          <span *ngIf="usedLlm() !== null" class="agent-mode" [class.agent-mode--llm]="usedLlm()">
            {{ usedLlm() ? 'Respuesta LLM' : 'Respuesta determinística' }}
          </span>
          <p class="disclaimer">{{ disclaimer() }}</p>
        </div>
        <app-agent-input #agentInput [loading]="loadingResponse()" (questionSubmitted)="sendQuestion($event)"></app-agent-input>
      </app-card>
    </section>
  `,
})
export class AgentChatPageComponent implements OnInit {
  @ViewChild('agentInput') agentInput?: AgentInputComponent;

  messages = signal<ChatMessage[]>([]);
  suggestedQuestions = signal<SuggestedQuestion[]>([]);
  loadingResponse = signal(false);
  activeClaimId = signal<string | null>(null);
  disclaimer = signal('La respuesta representa una alerta de revisión, no una acusación de fraude.');
  usedLlm = signal<boolean | null>(null);
  private readonly timeoutResponse =
    'El agente tardó más de lo esperado y detuve la consulta. Ya puedes enviar otra pregunta o intentarlo de nuevo.';
  private readonly unavailableResponse =
    'No pude completar la respuesta. Ya puedes enviar otra pregunta o reformular la consulta.';
  private sessionId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private agentService: AgentService
  ) {}

  ngOnInit(): void {
    this.agentService.getSuggestedQuestions().subscribe((questions) => this.suggestedQuestions.set(questions));
    this.route.queryParamMap.subscribe((params) => {
      const claimId = params.get('claim_id')?.trim().toUpperCase() ?? null;
      const changedClaim = claimId !== this.activeClaimId();
      this.activeClaimId.set(claimId);
      this.sessionId = this.agentService.getStoredSessionId(claimId);
      if (changedClaim) {
        this.messages.set([]);
        this.usedLlm.set(null);
      }
      if (claimId) {
        this.agentInput?.setQuestion('Explícame el riesgo de este siniestro');
      }
    });
  }

  selectQuestion(item: SuggestedQuestion): void {
    this.agentInput?.setQuestion(item.question);
  }

  sendQuestion(question: string): void {
    const userMessage: ChatMessage = {
      id: this.createMessageId(),
      role: 'user',
      content: question,
      createdAt: new Date(),
    };
    this.messages.set([...this.messages(), userMessage]);
    this.loadingResponse.set(true);

    this.agentService
      .query(this.buildAgentRequest(question))
      .subscribe({
        next: (response) => {
          this.sessionId = response.sessionId ?? this.sessionId;
          this.usedLlm.set(response.usedLlm);
          this.disclaimer.set(response.disclaimer || this.disclaimer());
          this.appendAssistantMessage(response.answer, response.relatedData);
          this.loadingResponse.set(false);
        },
        error: (error) => {
          this.appendAssistantMessage(this.resolveUnavailableResponse(error));
          this.loadingResponse.set(false);
        },
      });
  }

  private createMessageId(): string {
    return `${Date.now()}-${Math.random()}`;
  }

  private buildAgentRequest(question: string): AgentQueryRequest {
    const claimId = this.activeClaimId();
    const request: AgentQueryRequest = {
      question,
      claimId,
      sessionId: this.sessionId,
      useLlm: true,
    };

    return request;
  }

  private appendAssistantMessage(content: string, relatedData?: string[]): void {
    this.messages.set([
      ...this.messages(),
      {
        id: this.createMessageId(),
        role: 'assistant',
        content,
        relatedData,
        createdAt: new Date(),
      },
    ]);
  }

  private resolveUnavailableResponse(error: unknown): string {
    return this.isTimeoutError(error) ? this.timeoutResponse : this.unavailableResponse;
  }

  private isTimeoutError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'name' in error && error.name === 'TimeoutError';
  }
}
