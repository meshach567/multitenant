// src/auth/types/authenticated-user.type.ts
export interface AuthenticatedUser {
  userId: string;
  role: string;
  businessId?: string;
}
