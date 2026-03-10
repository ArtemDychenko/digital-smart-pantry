import { Injectable, signal } from '@angular/core';

const COOKIE_NAME = 'conversation-id';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  readonly conversationId = signal(this.getOrCreateId());

  startNewChat(): void {
    const newId = crypto.randomUUID();
    this.setCookie(newId);
    this.conversationId.set(newId);
  }

  getConversationId(): string {
    return this.conversationId();
  }

  private getOrCreateId(): string {
    const existing = this.getCookie();
    if (existing) return existing;

    const newId = crypto.randomUUID();
    this.setCookie(newId);
    return newId;
  }

  private getCookie(): string | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  }

  private setCookie(value: string): void {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; path=/; SameSite=Strict`;
  }
}
