import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreCardComponent } from '../../../../shared/components/score-card/score-card.component';
import { ClaimDetail } from '../../models/claim.model';

@Component({
  selector: 'app-claim-score-summary',
  standalone: true,
  imports: [CommonModule, ScoreCardComponent],
  template: `
    <app-score-card
      [finalScore]="claim.score.finalScore"
      [rulesScore]="claim.score.rulesScore"
      [aiScore]="claim.score.aiScore"
      [nlpScore]="claim.score.nlpScore"
      [riskLevel]="claim.score.level"
      [recommendation]="claim.score.recommendation"
    ></app-score-card>
  `,
})
export class ClaimScoreSummaryComponent {
  @Input({ required: true }) claim!: ClaimDetail;
}
