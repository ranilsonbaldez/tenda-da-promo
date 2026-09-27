// src/types/index.ts

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

export interface Offer {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image_url: string;
  original_price?: number;
  promotional_price: number;
  coupon_code?: string;
  affiliate_link: string;
  store_id: string;
  is_featured: boolean;
  expires_at?: string;
  created_at: string;
  stores?: Store;
}
