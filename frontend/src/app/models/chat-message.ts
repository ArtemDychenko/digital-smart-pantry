import { UserRole } from '@models/user-role';

export interface ChatMessage {
  id: number;
  text: string;
  date: Date;
  userRole: UserRole;
}

let nextId = 1;

export function createChatMessage(text: string, userRole: UserRole): ChatMessage {
  return { id: nextId++, text, date: new Date(), userRole };
}

export function resetChatMessageId(): void {
  nextId = 1;
}
