import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LLMApi } from '@api/llm.api';
import { AssistantChatMessage } from '@components/assistant-chat/assistant-chat-message/assistant-chat-message';
import { ChatMessage } from '@models/chat-message';
import { UserRole } from '@models/user-role';

@Component({
  selector: 'app-assistant-chat',
  imports: [FormsModule, AssistantChatMessage],
  templateUrl: './assistant-chat.html',
  styleUrl: './assistant-chat.scss',
})
export class AssistantChat {
  private readonly llmApi = inject(LLMApi);

  initialState: boolean = true;
  chatHistory: ChatMessage[] = [];
  userPrompt: string = '';
  loading: boolean = false;
  private nextId: number = 1;

  sendPrompt(): void {
    if (!this.userPrompt.trim() || this.loading) return;

    this.initialState = false;
    this.loading = true;

    this.chatHistory.push({
      id: this.nextId++,
      text: this.userPrompt,
      date: new Date(),
      userRole: UserRole.USER,
    });

    const promptToSend = this.userPrompt;
    this.userPrompt = '';

    this.llmApi.command({ userPrompt: promptToSend }).subscribe({
      next: (response) => {
        this.chatHistory.push({
          id: this.nextId++,
          text: response.message,
          date: new Date(),
          userRole: UserRole.ASSISTANT,
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      },
    });
  }
}
