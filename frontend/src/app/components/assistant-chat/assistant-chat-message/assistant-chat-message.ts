import { Component, input } from '@angular/core';
import { ChatMessage } from '@models/chat-message';
import { UserRole } from '@models/user-role';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-assistant-chat-message',
  imports: [CardModule],
  templateUrl: './assistant-chat-message.html',
  styleUrl: './assistant-chat-message.scss',
})
export class AssistantChatMessage {
  message = input.required<ChatMessage>();
  UserRole = UserRole;
}
