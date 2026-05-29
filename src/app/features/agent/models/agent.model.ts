export interface AgentQueryRequest {
  question: string;
  claimId?: string | null;
  sessionId?: string | null;
  userId?: string | null;
  useLlm?: boolean | null;
}

export interface AgentQueryApiRequest {
  question: string;
  claim_id?: string | null;
  session_id?: string | null;
  user_id?: string | null;
  use_llm?: boolean | null;
}

export interface AgentQueryApiResponse {
  answer: string;
  session_id?: string | null;
  claim_id?: string | null;
  sources?: string[];
  used_llm?: boolean;
  disclaimer?: string;
}

export interface AgentQueryResponse {
  answer: string;
  sessionId?: string | null;
  claimId?: string | null;
  internalClaimId?: string | null;
  sources: string[];
  usedLlm: boolean;
  disclaimer: string;
  relatedData: string[];
}

export interface SuggestedQuestion {
  id: string;
  question: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  relatedData?: string[];
}

export function mapAgentRequestToApi(request: AgentQueryRequest): AgentQueryApiRequest {
  return {
    question: request.question,
    claim_id: request.claimId,
    session_id: request.sessionId,
    user_id: request.userId,
    use_llm: request.useLlm,
  };
}

export function mapAgentResponseFromApi(dto: AgentQueryApiResponse): AgentQueryResponse {
  return {
    answer: dto.answer,
    sessionId: dto.session_id,
    claimId: dto.claim_id,
    internalClaimId: dto.claim_id,
    sources: dto.sources ?? [],
    usedLlm: dto.used_llm ?? false,
    disclaimer: dto.disclaimer ?? 'La respuesta representa una alerta de revisión, no una acusación de fraude.',
    relatedData: dto.sources ?? [],
  };
}
