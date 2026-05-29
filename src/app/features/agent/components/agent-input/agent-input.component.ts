import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppButtonComponent } from '../../../../shared/components/button/app-button.component';

@Component({
  selector: 'app-agent-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppButtonComponent],
  template: `
    <form class="agent-input" [formGroup]="form" (ngSubmit)="submit()">
      <input type="text" formControlName="question" maxlength="800" placeholder="Pregunta al agente IA..." />
      <app-button label="Enviar" type="submit" [disabled]="form.invalid || loading" [loading]="loading"></app-button>
    </form>
  `,
})
export class AgentInputComponent {
  @Input() loading = false;
  @Output() questionSubmitted = new EventEmitter<string>();

  form = this.formBuilder.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(800)]],
  });

  constructor(private formBuilder: FormBuilder) {}

  setQuestion(question: string): void {
    this.form.patchValue({ question });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const question = this.form.getRawValue().question.trim();
    this.questionSubmitted.emit(question);
    this.form.reset({ question: '' });
  }
}
