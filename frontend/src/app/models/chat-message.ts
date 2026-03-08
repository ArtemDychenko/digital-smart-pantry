import { UserRole } from '@models/user-role';

export interface ChatMessage {
  id: number;
  text: string;
  date: Date;
  userRole: UserRole;
}
