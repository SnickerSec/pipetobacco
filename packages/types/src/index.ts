// Shared TypeScript types for The Ember Society

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  displayName: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// More types will be added as features are developed
