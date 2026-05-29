import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuggestedQuestion } from '../../models/agent.model';

@Component({
  selector: 'app-suggested-questions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="suggested-questions">
      <button *ngFor="let item of questions" type="button" (click)="questionSelected.emit(item)">
        {{ item.question }}
      </button>
    </div>
  `,
})
export class SuggestedQuestionsComponent {
  @Input() questions: SuggestedQuestion[] = [];
  @Output() questionSelected = new EventEmitter<SuggestedQuestion>();
}
