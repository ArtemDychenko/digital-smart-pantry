import { Component, inject, input } from '@angular/core';
import { ChatMessage } from '@models/chat-message';
import { UserRole } from '@models/user-role';
import { CardModule } from 'primeng/card';
import { MessageProcessor, Surface } from '@a2ui/angular';

@Component({
  selector: 'app-assistant-chat-message',
  imports: [CardModule, Surface],
  templateUrl: './assistant-chat-message.html',
  styleUrl: './assistant-chat-message.scss',
})
export class AssistantChatMessage {
  message = input.required<ChatMessage>();
  UserRole = UserRole;
  protected processor = inject(MessageProcessor);

  get ownSurfaces() {
    const ids = new Set(this.message().a2uiSurfaceIds ?? []);
    return [...this.processor.getSurfaces().entries()].filter(([id]) => ids.has(id));
  }
}
