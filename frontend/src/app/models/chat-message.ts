import { UserRole } from '@models/user-role';

export interface ChatMessage {
  id: number;
  text: string;
  date: Date;
  userRole: UserRole;
  a2uiSurfaceIds?: string[];
}

let nextId = 1;

export function createChatMessage(
  text: string,
  userRole: UserRole,
  a2uiSurfaceIds?: string[],
): ChatMessage {
  return { id: nextId++, text, date: new Date(), userRole, a2uiSurfaceIds };
}

export function resetChatMessageId(): void {
  nextId = 1;
}
