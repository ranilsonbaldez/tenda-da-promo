// src/types/index.ts

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Offer {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image_url: string;
  original_price?: number | null;
  promotional_price: number;
  coupon_code?: string | null;
  affiliate_link: string;
  store_id: string;
  category_id?: string | null;
  is_featured: boolean;
  expires_at?: string | null;
  created_at: string;
  stores?: Store | null;
  categories?: Category | null;
}
