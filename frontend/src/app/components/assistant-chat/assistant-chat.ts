import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantChat {
  private readonly llmApi = inject(LLMApi);
  private nextId: number = 1;

  initialState = signal(true);
  chatHistory = signal<ChatMessage[]>([]);
  userPrompt: string = '';
  loading = signal(false);

  sendPrompt(): void {
    const text = this.userPrompt.trim();
    if (!text || this.loading()) return;

    this.initialState.set(false);
    this.loading.set(true);

    this.chatHistory.update((history) => [
      ...history,
      {
        id: this.nextId++,
        text,
        date: new Date(),
        userRole: UserRole.USER,
      },
    ]);

    this.userPrompt = '';

    this.llmApi.command({ userPrompt: text }).subscribe({
      next: (response) => {
        this.chatHistory.update((history) => [
          ...history,
          {
            id: this.nextId++,
            text: response.message,
            date: new Date(),
            userRole: UserRole.ASSISTANT,
          },
        ]);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading.set(false);
      },
    });
  }
}
