import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {LLMApi} from '@api/llm.api';

@Component({
  selector: 'app-assistant',
  imports: [
    FormsModule
  ],
  templateUrl: './assistant.html',
  styleUrl: './assistant.scss',
})
export class Assistant {
  private readonly llmApi = inject(LLMApi);

  userPrompt: string = '';
  responseMessage: string = '';

  sendPrompt(): void {
    if (!this.userPrompt.trim()) return;

    this.llmApi.command({ userPrompt: this.userPrompt }).subscribe({
      next: (response) => {
      this.responseMessage = response.message;
      this.userPrompt = '';
    },
      error: (err) => console.error('Error:', err)
    });
  }
}
