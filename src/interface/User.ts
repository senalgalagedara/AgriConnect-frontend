export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  contactNumber?: string;
  address?: string;
  role: UserRole;
  status: UserStatus; // retained from prior UI model (not in DB schema yet if absent)
  createdAt: Date;
  updatedAt?: Date;
}

export type UserRole = 'farmer' | 'consumer' | 'driver' | 'admin';
export type UserStatus = 'active' | 'inactive';

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber?: string;
  role: UserRole;
  address?: string;
  password: string;
}

// Helper for constructing display name consistently
export function getUserDisplayName(u: Partial<User>): string {
  const first = u.firstName?.trim() || '';
  const last = u.lastName?.trim() || '';
  const combined = `${first} ${last}`.trim();
  return combined || u.email || 'User';
}