export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  image1?: string;
  created_at?: string;
  updated_at?: string;
  category_id?: string;
  brand_id?: string;
  is_featured?: boolean;
  order_number?: number;
  quantity?: number;
  brands?: {
    id: string;
    name: string;
  };
  categories?: {
    id: string;
    name: string;
  };
  brand?: string;
  category?: string;
}
