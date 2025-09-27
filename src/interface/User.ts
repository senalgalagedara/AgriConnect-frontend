export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  address: string;
}

export type UserRole = 'farmer' | 'consumer' | 'driver';
export type UserStatus = 'active' | 'inactive';

export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  address: string;
}