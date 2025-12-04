import { Product } from './product.model';
import { User } from './user.model';

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  address_id: number;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  notes?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  address?: Address;
  payment?: Payment;
  user?: User;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  seller_id: number;
  product_name: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  subtotal: number;
  product?: Product;
  seller?: User;
}

export interface Address {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  region?: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
}

export interface Payment {
  id: number;
  order_id: number;
  user_id: number;
  transaction_id?: string;
  payment_method: 'cash' | 'card' | 'wave' | 'orange_money' | 'free_money';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paid_at?: string;
}

export interface CreateOrderRequest {
  address_id: number;
  payment_method: 'cash' | 'card' | 'wave' | 'orange_money' | 'free_money';
  notes?: string;
}
