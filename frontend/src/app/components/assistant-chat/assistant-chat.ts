import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LLMApi } from '@api/llm.api';
import { AssistantChatMessage } from '@components/assistant-chat/assistant-chat-message/assistant-chat-message';
import { ChatMessage, createChatMessage, resetChatMessageId } from '@models/chat-message';
import { UserRole } from '@models/user-role';
import { ConversationService } from '../../services/conversation.service';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-assistant-chat',
  imports: [FormsModule, AssistantChatMessage, Button],
  templateUrl: './assistant-chat.html',
  styleUrl: './assistant-chat.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantChat {
  private readonly llmApi = inject(LLMApi);
  private readonly conversationService = inject(ConversationService);
  private readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  initialState = signal(true);
  chatHistory = signal<ChatMessage[]>([]);
  userPrompt: string = '';
  loading = signal(false);

  constructor() {
    effect(() => {
      this.chatHistory();
      this.scrollToBottom();
    });

    effect(() => {
      this.conversationService.conversationId();
      this.chatHistory.set([]);
      this.initialState.set(true);
      this.userPrompt = '';
      resetChatMessageId();
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.scrollContainer()?.nativeElement;
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    });
  }

  sendPrompt(): void {
    const text = this.userPrompt.trim();
    if (!text || this.loading()) return;

    this.initialState.set(false);
    this.loading.set(true);

    this.chatHistory.update((history) => [...history, createChatMessage(text, UserRole.USER)]);

    this.userPrompt = '';

    this.llmApi.command({ userPrompt: text }).subscribe({
      next: (response) => {
        this.chatHistory.update((history) => [
          ...history,
          createChatMessage(response.message, UserRole.ASSISTANT),
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
