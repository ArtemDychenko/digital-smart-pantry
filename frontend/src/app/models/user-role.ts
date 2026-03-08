export enum UserRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export function isValidUserRole(role: string): boolean {
  return Object.values(UserRole).includes(role as UserRole);
}
