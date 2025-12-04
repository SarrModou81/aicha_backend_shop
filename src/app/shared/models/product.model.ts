export interface Product {
  id: number;
  user_id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price?: number;
  brand?: string;
  sizes?: string[];
  colors?: string[];
  images: string[];
  stock: number;
  stock_alert_threshold: number;
  is_visible: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  seller?: User;
  average_rating?: number;
  reviews_count?: number;
  final_price?: number;
  is_on_sale?: boolean;
  discount_percentage?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent_id?: number;
  is_active: boolean;
  children?: Category[];
}

export interface ProductFilter {
  search?: string;
  category_id?: number;
  brand?: string;
  min_price?: number;
  max_price?: number;
  size?: string;
  color?: string;
  on_sale?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}
