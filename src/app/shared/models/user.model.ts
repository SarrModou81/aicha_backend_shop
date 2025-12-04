export interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'vendeur' | 'admin';
  phone?: string;
  shop_name?: string;
  shop_description?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  role: 'client' | 'vendeur';
  shop_name?: string;
  shop_description?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
