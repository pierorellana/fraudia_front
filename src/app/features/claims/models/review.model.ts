export type HumanReviewDecision = 'approve' | 'reject' | 'escalate' | 'request_information';

export interface ReviewRequest {
  decision: HumanReviewDecision;
  comment: string;
  reviewer: string;
  reviewStatus: string;
}

export interface ReviewHistoryItem extends ReviewRequest {
  id: string;
  claimId: string;
  createdAt: string;
}
