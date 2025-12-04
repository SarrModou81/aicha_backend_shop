import { Product } from './product.model';

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  total_items: number;
  subtotal: number;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  subtotal: number;
  product: Product;
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
  size?: string;
  color?: string;
}
